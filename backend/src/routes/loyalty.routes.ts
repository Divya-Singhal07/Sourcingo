
import { Router } from "express";
import { z } from "zod";
import { createUserClient } from "../lib/supabase";
import {
  requireAuth,
  type AuthRequest,
  allowRoles,
} from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// Validate customer UUIDs.
const customerIdSchema = z.string().uuid();

// GET /api/loyalty/:customerId/orders
// Return payment information for the authenticated buyer.
// A buyer can only retrieve their own orders.
router.get(
  "/:customerId/orders",
  allowRoles("buyer"),
  async (req, res) => {
    const authReq = req as AuthRequest;
    const parsedId = customerIdSchema.safeParse(req.params.customerId);

    if (!parsedId.success) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    const db = createUserClient(authReq.accessToken!);

    // Verify that the requested customer belongs to this user.
    const { data: business, error: businessError } = await db
      .from("businesses")
      .select("id")
      .eq("owner_id", authReq.userId!)
      .eq("role", "buyer")
      .maybeSingle();

    if (businessError) {
      return res.status(500).json({
        error: "Could not verify buyer",
        details: businessError.message,
      });
    }

    if (!business) {
      return res.status(404).json({ error: "Buyer business not found" });
    }

    const { data: buyer, error: buyerError } = await db
      .from("buyers")
      .select("id, loyalty_score")
      .eq("business_id", business.id)
      .maybeSingle();

    if (buyerError) {
      return res.status(500).json({
        error: "Could not fetch buyer",
        details: buyerError.message,
      });
    }

    if (!buyer || buyer.id !== parsedId.data) {
      return res.status(403).json({
        error: "You cannot access another buyer's orders",
      });
    }

    const { data: orders, error: ordersError } = await db
      .from("rfqs")
      .select(
        "id, buyer_id, status, delivered_at, payment_due_at, total_amount, advance_paid, created_at"
      )
      .eq("buyer_id", buyer.id)
      .order("created_at", { ascending: false });

    if (ordersError) {
      return res.status(500).json({
        error: "Could not fetch orders",
        details: ordersError.message,
      });
    }

    const rfqIds = (orders ?? []).map((order) => order.id);

    let payments: Array<{
      rfq_id: string;
      balance_due: number;
      balance_paid: number;
      paid_at: string | null;
    }> = [];

    if (rfqIds.length > 0) {
      const { data, error: paymentsError } = await db
        .from("order_payments")
        .select("rfq_id, balance_due, balance_paid, paid_at")
        .in("rfq_id", rfqIds);

      if (paymentsError) {
        return res.status(500).json({
          error: "Could not fetch payments",
          details: paymentsError.message,
        });
      }

      payments = (data ?? []).map((payment) => ({
        rfq_id: payment.rfq_id,
        balance_due: Number(payment.balance_due),
        balance_paid: Number(payment.balance_paid),
        paid_at: payment.paid_at,
      }));
    }

    const paymentByRfq = new Map(
      payments.map((payment) => [payment.rfq_id, payment])
    );

    return res.json({
      customerId: buyer.id,
      orders: (orders ?? []).map((order) => {
        const payment = paymentByRfq.get(order.id);

        return {
          orderId: order.id,
          orderStatus: order.status,
          shippingOrDeliveryDate: order.delivered_at,
          dueDate: order.payment_due_at,
          // These names follow the current scoring service contract.
          balanceDue: payment?.balance_due ?? 0,
          balancePaid: payment?.balance_paid ?? 0,
          paidAt: payment?.paid_at ?? null,
          currency: "INR",
        };
      }),
    });
  }
);

// GET /api/loyalty/:customerId/score
// Return the buyer's currently stored score.
router.get(
  "/:customerId/score",
  allowRoles("buyer"),
  async (req, res) => {
    const authReq = req as AuthRequest;
    const parsedId = customerIdSchema.safeParse(req.params.customerId);

    if (!parsedId.success) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    const db = createUserClient(authReq.accessToken!);

    const { data: business, error: businessError } = await db
      .from("businesses")
      .select("id")
      .eq("owner_id", authReq.userId!)
      .eq("role", "buyer")
      .maybeSingle();

    if (businessError) {
      return res.status(500).json({
        error: "Could not verify buyer",
        details: businessError.message,
      });
    }

    if (!business) {
      return res.status(404).json({ error: "Buyer business not found" });
    }

    const { data: buyer, error } = await db
      .from("buyers")
      .select("id, loyalty_score")
      .eq("business_id", business.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Could not fetch loyalty score",
        details: error.message,
      });
    }

    if (!buyer || buyer.id !== parsedId.data) {
      return res.status(403).json({
        error: "You cannot access another buyer's score",
      });
    }

    return res.json({
      customerId: buyer.id,
      loyaltyScore: buyer.loyalty_score,
    });
  }
);

// PUT /api/loyalty/:customerId/score
// Save a score calculated by your trusted scoring service.
router.put(
  "/:customerId/score",
  allowRoles("buyer"),
  async (req, res) => {
    const authReq = req as AuthRequest;
    const parsedId = customerIdSchema.safeParse(req.params.customerId);

    if (!parsedId.success) {
      return res.status(400).json({ error: "Invalid customer ID" });
    }

    const bodySchema = z.object({
      loyaltyScore: z.number().int().min(0).max(100),
      calculationVersion: z.string().trim().min(1).max(30),
    });

    const parsedBody = bodySchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        error: "Invalid score payload",
        details: parsedBody.error.flatten(),
      });
    }

    const db = createUserClient(authReq.accessToken!);

    const { data: business, error: businessError } = await db
      .from("businesses")
      .select("id")
      .eq("owner_id", authReq.userId!)
      .eq("role", "buyer")
      .maybeSingle();

    if (businessError) {
      return res.status(500).json({
        error: "Could not verify buyer",
        details: businessError.message,
      });
    }

    if (!business) {
      return res.status(404).json({ error: "Buyer business not found" });
    }

    const { data: buyer, error: buyerError } = await db
      .from("buyers")
      .select("id")
      .eq("business_id", business.id)
      .maybeSingle();

    if (buyerError) {
      return res.status(500).json({
        error: "Could not fetch buyer",
        details: buyerError.message,
      });
    }

    if (!buyer || buyer.id !== parsedId.data) {
      return res.status(403).json({
        error: "You cannot update another buyer's score",
      });
    }

    const { data: updatedBuyer, error: updateError } = await db
      .from("buyers")
      .update({ loyalty_score: parsedBody.data.loyaltyScore })
      .eq("id", buyer.id)
      .select("id, loyalty_score")
      .single();

    if (updateError) {
      return res.status(500).json({
        error: "Could not save loyalty score",
        details: updateError.message,
      });
    }

    return res.json({
      message: "Loyalty score saved successfully",
      customerId: updatedBuyer.id,
      loyaltyScore: updatedBuyer.loyalty_score,
      calculationVersion: parsedBody.data.calculationVersion,
    });
  }
);

export default router;
