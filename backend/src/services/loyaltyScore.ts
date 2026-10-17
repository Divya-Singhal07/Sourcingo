
export interface LoyaltyOrder {
  orderId: string;
  orderStatus: string;
  shippingOrDeliveryDate: string | null;
  balanceDue: number;
  balancePaid: number;
  paidAt: string | null;
  dueDate: string | null;
  currency: string;
}

export interface LoyaltyScoreResult {
  customerId: string;
  loyaltyScore: number | null;
  ordersEvaluated: number;
  onTimePaymentRate: number | null;
  averageDelayDays: number | null;
  overdueBalance: number;
}

const EXCLUDED_STATUSES = new Set([
  "cancelled",
  "canceled",
  "disputed",
]);

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function roundToTwo(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function isValidDate(value: string | null): value is string {
  return value !== null && Number.isFinite(Date.parse(value));
}

export function calculateLoyaltyScore(
  customerId: string,
  orders: LoyaltyOrder[],
  asOfDate: Date = new Date()
): LoyaltyScoreResult {
  if (!Number.isFinite(asOfDate.getTime())) {
    throw new Error("Invalid score reference date");
  }

  const referenceTime = asOfDate.getTime();

  const validOrders = orders.filter((order) => {
    if (EXCLUDED_STATUSES.has(order.orderStatus.toLowerCase())) {
      return false;
    }

    if (!isValidDate(order.dueDate)) {
      return false;
    }

    if (Date.parse(order.dueDate) > referenceTime) {
      // Future payment obligations do not affect the score yet.
      return false;
    }

    if (
      !Number.isFinite(order.balanceDue) ||
      !Number.isFinite(order.balancePaid) ||
      order.balanceDue <= 0 ||
      order.balancePaid < 0 ||
      order.balancePaid > order.balanceDue
    ) {
      return false;
    }

    if (order.paidAt !== null && !isValidDate(order.paidAt)) {
      return false;
    }

    return true;
  });

  if (validOrders.length === 0) {
    return {
      customerId,
      loyaltyScore: null,
      ordersEvaluated: 0,
      onTimePaymentRate: null,
      averageDelayDays: null,
      overdueBalance: 0,
    };
  }

  let totalDue = 0;
  let totalPaid = 0;
  let onTimeOrders = 0;
  let totalDelayDays = 0;
  let overdueBalance = 0;

  for (const order of validOrders) {
    const dueTime = Date.parse(order.dueDate!);
    const paid = order.balancePaid;
    const due = order.balanceDue;
    const isFullyPaid = paid >= due;

    totalDue += due;
    totalPaid += paid;

    // Outstanding balance is the unpaid portion of this obligation.
    const outstanding = Math.max(0, due - paid);

    if (!isFullyPaid && referenceTime > dueTime) {
      overdueBalance += outstanding;
    }

    if (isFullyPaid && order.paidAt !== null) {
      const paymentTime = Date.parse(order.paidAt);

      if (paymentTime <= dueTime) {
        onTimeOrders++;
      }

      totalDelayDays += Math.max(
        0,
        Math.floor((paymentTime - dueTime) / DAY_IN_MS)
      );
    } else if (!isFullyPaid) {
      // An unpaid obligation that is already due counts as late.
      const delayDays = Math.max(
        0,
        Math.floor((referenceTime - dueTime) / DAY_IN_MS)
      );

      totalDelayDays += delayDays;
    } else {
      // Fully paid but without a reliable payment timestamp:
      // do not assume it was paid on time.
      totalDelayDays += 0;
    }
  }

  const onTimePaymentRate =
    (onTimeOrders / validOrders.length) * 100;

  const paymentCompletionRate =
    Math.min(100, (totalPaid / totalDue) * 100);

  const averageDelayDays =
    totalDelayDays / validOrders.length;

  const punctualityScore = onTimePaymentRate;

  const consistencyScore = Math.max(
    0,
    100 - averageDelayDays * 10
  );

  const rawScore =
    punctualityScore * 0.6 +
    paymentCompletionRate * 0.25 +
    consistencyScore * 0.15;

  return {
    customerId,
    loyaltyScore: Math.max(
      0,
      Math.min(100, Math.round(rawScore))
    ),
    ordersEvaluated: validOrders.length,
    onTimePaymentRate: roundToTwo(onTimePaymentRate),
    averageDelayDays: roundToTwo(averageDelayDays),
    overdueBalance: roundToTwo(overdueBalance),
  };
}
