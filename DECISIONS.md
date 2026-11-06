# Decisions

## 1. Which discount wins when both apply
**The one that saves the customer more.** Only one discount is ever applied. With the current numbers (early bird 15%, company 10%) that means early bird always wins when both qualify. Both are percentages of the same price, so comparing percentages is the same as comparing rupees. A tie goes to early bird. The invoice shows the original price, the discount name and the amount due, so the operator can see why.

## 2. Which date sets the early-bird price for a seat accepted from the waitlist
**The original enrollment date, not the date the operator accepts.** The person asked for the seat on that date, and the waitlist is already ordered by it. If the date moved to acceptance, a person could lose the discount because someone else cancelled late, which they cannot control. This is used everywhere: the price is calculated from `enrolledAt`.
The company discount is different: it depends on who is confirmed at that moment, so it is checked when the operator accepts, and counts the accepting person.

## 3. Two cases I considered and chose not to support
- **Repricing earlier colleagues.** If a third colleague joins, the first two are not refunded or repriced. A price is fixed when the seat is confirmed. Repricing would mean changing amounts that may already have been invoiced.
- **Offers that expire.** An offered seat is held until the operator accepts or declines. There is no timer that passes it to the next person, because the operator is in the loop and a background job was out of scope.

## Other rules I chose
- Two sessions clash only if they truly overlap. One ending at 11:00 and another starting at 11:00 do not clash.
- Only confirmed seats cause clashes. The clash is checked again when an offer is accepted.
- Offered seats count as taken, so nobody can take a seat held for an offered person.
- A waitlisted person is not charged. Price fields are empty until the seat is confirmed.
- One email is one person. The same email with a different company is rejected, so the company name cannot be changed to unlock the company discount. Emails are lowercased, and company names are compared ignoring case and extra spaces.
- When several sessions are selected, each is handled separately; one clash does not block the others.
- Seat counting runs in a transaction with a row lock on the session, so two operators cannot take the last seat at once.
- Decline is cancel plus an offer to the next person, because every visible button must work.

