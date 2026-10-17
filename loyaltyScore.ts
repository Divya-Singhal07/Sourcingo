
interface LoyaltyOrder {
  orderId: string;
  orderStatus: string;
  shippingOrDeliveryDate: string | null;
  balanceDue: number;
  balancePaid: number;
  paidAt: string | null;
  dueDate: string;
  currency: string;
}

interface LoyaltyScoreResult {
  customerId: string;
  loyaltyScore: number | null;
  ordersEvaluated: number;
  onTimePaymentRate: number | null;
  averageDelayDays: number | null;
  overdueBalance: number;
}

export function calculateLoyaltyScore(
  customerId: string,
  orders: LoyaltyOrder[],
  asOfDate: string = new Date().toISOString()
): LoyaltyScoreResult {
  const eligibleOrders = orders.filter(order => {
    const status = order.orderStatus.toLowerCase();

    return (
      !["cancelled", "canceled", "disputed"].includes(status) &&
      order.balanceDue > 0
    );
  });

  let punctualityTotal = 0;
  let totalBalanceDue = 0;
  let totalBalancePaid = 0;
  let totalDelayDays = 0;
  let overdueBalance = 0;
  let settledOrders = 0;
  let onTimeOrders = 0;
  let evaluatedOrders = 0;

  const now = Date.parse(asOfDate);

  if (!Number.isFinite(now)) {
    throw new Error("Invalid evaluation date");
  }

  for (const order of eligibleOrders) {
    if (
      !Number.isFinite(order.balanceDue) ||
      !Number.isFinite(order.balancePaid) ||
      order.balanceDue < 0 ||
      order.balancePaid < 0 ||
      order.balancePaid > order.balanceDue
    ) {
      throw new Error(`Invalid balance for order ${order.orderId}`);
    }

    const dueDate = Date.parse(order.dueDate);

    if (!Number.isFinite(dueDate)) {
      throw new Error(`Invalid dueDate for order ${order.orderId}`);
    }

    const isSettled = order.balancePaid === order.balanceDue;

    // Orders that are not yet due must not be penalized.
    if (!isSettled && now <= dueDate) {
      continue;
    }

    if (isSettled && !order.paidAt) {
      throw new Error(`Missing paidAt for ${order.orderId}`);
    }

    const referenceDate = isSettled
      ? Date.parse(order.paidAt!)
      : now;

    if (!Number.isFinite(referenceDate)) {
      throw new Error(`Invalid paidAt for ${order.orderId}`);
    }

    const delayDays = Math.max(
      0,
      Math.floor((referenceDate - dueDate) / 86400000)
    );

    // 100 points on time, minus 10 points per late day.
    const punctualityScore = Math.max(
      0,
      100 - delayDays * 10
    );

    punctualityTotal += punctualityScore;
    totalBalanceDue += order.balanceDue;
    totalBalancePaid += order.balancePaid;
    totalDelayDays += delayDays;
    evaluatedOrders++;

    if (isSettled) {
      settledOrders++;

      if (referenceDate <= dueDate) {
        onTimeOrders++;
      }
    } else {
      overdueBalance += order.balanceDue - order.balancePaid;
    }
  }

  if (evaluatedOrders === 0) {
    return {
      customerId,
      loyaltyScore: null,
      ordersEvaluated: 0,
      onTimePaymentRate: null,
      averageDelayDays: null,
      overdueBalance: 0
    };
  }

  const punctuality = punctualityTotal / evaluatedOrders;

  const paymentCompletion =
    totalBalanceDue > 0
      ? (totalBalancePaid / totalBalanceDue) * 100
      : 100;

  const averageDelay = totalDelayDays / evaluatedOrders;

  const consistency = Math.max(
    0,
    100 - averageDelay * 10
  );

  const loyaltyScore = Math.round(
    punctuality * 0.60 +
    paymentCompletion * 0.25 +
    consistency * 0.15
  );

  return {
    customerId,
    loyaltyScore,
    ordersEvaluated: evaluatedOrders,
    onTimePaymentRate:
      settledOrders > 0
        ? Math.round((onTimeOrders / settledOrders) * 100)
        : null,
    averageDelayDays: Math.round(averageDelay * 10) / 10,
    overdueBalance: Math.round(overdueBalance * 100) / 100
  };
}
