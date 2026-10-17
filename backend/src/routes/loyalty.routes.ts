
import { Router, type Response } from "express";
import { z } from "zod";

import { createUserClient } from "../lib/supabase";
import {
  requireAuth,
  allowRoles,
  type AuthRequest,
} from "../middleware/auth";
import {
  calculateLoyaltyScore,
  type LoyaltyOrder,
} from "../services/loyaltyScore";

const router = Router();

router.use(requireAuth);

const customerIdSchema = z.string().uuid();

type RouteError = {
  status: number;
  message: string;
};

async function loadOwnBuyer(
  req: AuthRequest,
  res: Response,
  customerId: string
) {
  const db = createUserClient(req.accessToken!);

  const { data: business, error: businessError } = await db
    .from("businesses")
    .select("id")
    .eq("owner_id", req.userId!)
    .eq("role", "buyer")
    .maybeSingle();

  if (businessError) {
    console.error("Buyer business lookup failed:", businessError.message);
    res.status(500).json({ error: "Could not verify buyer business" });
    return null;
  }

  if (!business) {
    res.status(404).json({ error: "Buyer business not found" });
    return null;
  }

  const { data: buyer, error: buyerError } = await db
    .from("buyers")
    .select("id, loyalty_score")
    .eq("business_id", business.id)
    .maybeSingle();

  if (buyerError) {
    console.error("Buyer lookup failed:", buyerError.message);
    res.status(500).json({ error: "Could not load buyer profile" });
    return null;
  }

  if (!buyer) {
    res.status(404).json({ error: "Buyer profile not found" });
    return null;
  }

  if (buyer.id !== customerId) {
    res.status(403).json({
      error: "You can only access your own loyalty information",
    });
    return null;
  }

  return { db, buyer };
}

async function loadBuyerOrders(
  db: ReturnType<typeof createUserClient>,
  customerId: string,
  res: Response
) {
  const { data: orders, error: ordersError } = await db
    .from("rfqs")
    .select(
      "id, buyer_id, status, delivered_at, payment_due_at, total_amount, advance_paid, created_at"
    )
    .eq("buyer_id", customerId)
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Order lookup failed:", ordersError.message);
    res.status(500).json({ error: "Could not fetch orders" });
    return null;
  }

  const rfqs = orders ?? [];
  const rfqIds = rfqs.map((order) => order.id);

  if (rfqIds.length === 0) {
    return { orders: rfqs, paymentByRfq: new Map() };
  }

  const { data: payments, error: paymentsError } = await db
    .from("order_payments")
    .select("rfq_id, balance_due, balance_paid, paid_at")
    .in("rfq_id", rfqIds);

  if (paymentsError) {
    console.error("Payment lookup failed:", paymentsError.message);
    res.status(500).json({ error: "Could not fetch payment history" });
    return null;
  }

  const paymentByRfq = new Map(
    (payments ?? []).map((payment) => [
      payment.rfq_id,
      {
        balanceDue: Number(payment.balance_due),
        balancePaid: Number(payment.balance_paid),
        paidAt: payment.paid_at,
      },
    ])
  );

  return { orders: rfqs, paymentByRfq };
}

router.get(
  "/:customerId/orders",
  allowRoles("buyer"),
  async (req, res) => {
    const authReq = req as AuthRequest;
    const parsedId = customerIdSchema.safeParse(req.params.customerId);

    if (!parsedId.success) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    try {
      const ownBuyer = await loadOwnBuyer(
        authReq,
        res,
        parsedId.data
      );

      if (!ownBuyer) return;

      const result = await loadBuyerOrders(
        ownBuyer.db,
        ownBuyer.buyer.id,
        res
      );

      if (!result) return;

      return res.json({
        customerId: ownBuyer.buyer.id,
        orders: result.orders.map((order) => {
          const payment = result.paymentByRfq.get(order.id);

          return {
            orderId: order.id,
            orderStatus: order.status,
            shippingOrDeliveryDate: order.delivered_at,
            dueDate: order.payment_due_at,
            totalAmount: order.total_amount,
            advancePaid: order.advance_paid,
            balanceDue: payment?.balanceDue ?? null,
            balancePaid: payment?.balancePaid ?? null,
            paidAt: payment?.paidAt ?? null,
            paymentRecordAvailable: Boolean(payment),
            currency: "INR",
          };
        }),
      });
    } catch (error) {
      console.error("Loyalty orders route failed:", error);
      return res.status(500).json({ error: "Could not load order history" });
    }
  }
);

router.get(
  "/:customerId/score",
  allowRoles("buyer"),
  async (req, res) => {
    const authReq = req as AuthRequest;
    const parsedId = customerIdSchema.safeParse(req.params.customerId);

    if (!parsedId.success) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    try {
      const ownBuyer = await loadOwnBuyer(
        authReq,
        res,
        parsedId.data
      );

      if (!ownBuyer) return;

      const result = await loadBuyerOrders(
        ownBuyer.db,
        ownBuyer.buyer.id,
        res
      );

      if (!result) return;

      // Orders without a payment record or due date cannot be scored.
      const scoreOrders: LoyaltyOrder[] = result.orders.flatMap((order) => {
        const payment = result.paymentByRfq.get(order.id);

        if (!payment || !order.payment_due_at) {
          return [];
        }

        return [{
          orderId: order.id,
          orderStatus: order.status,
          shippingOrDeliveryDate: order.delivered_at,
          balanceDue: payment.balanceDue,
          balancePaid: payment.balancePaid,
          paidAt: payment.paidAt,
          dueDate: order.payment_due_at,
          currency: "INR",
        }];
      });

      const score = calculateLoyaltyScore(
        ownBuyer.buyer.id,
        scoreOrders
      );

      // Never accept a score sent by the client.
      // Do not overwrite a stored score when there is no valid history.
      if (score.loyaltyScore !== null) {
        const { error: updateError } = await ownBuyer.db
          .from("buyers")
          .update({ loyalty_score: score.loyaltyScore })
          .eq("id", ownBuyer.buyer.id);

        if (updateError) {
          console.error("Saving loyalty score failed:", updateError.message);
          return res.status(500).json({
            error: "Score was calculated but could not be saved",
          });
        }
      }

      return res.json({
        ...score,
        scoreStatus:
          score.loyaltyScore === null
            ? "insufficient_payment_history"
            : "calculated",
      });
    } catch (error) {
      console.error("Loyalty score route failed:", error);
      return res.status(500).json({ error: "Could not calculate loyalty score" });
    }
  }
);

export default router;
