import cds from "@sap/cds";

const { SELECT, UPDATE, INSERT } = cds.ql;

export default cds.service.impl(function () {
  this.before("READ", "Books", async (req) => {
    console.log("Authenticated user:", req.user.id);
    console.log("User roles:", req.user.roles);
  });

  this.before("SAVE", "Books", async (req) => {
    const { price } = req.data;
    if (price !== undefined && price !== null && Number(price) > 1000) {
      return req.error(
        400,
        `Price ${price} exceeds the maximum allowed 1000`,
        "price",
      );
    }
  });

  this.before("CREATE", "Orders", async (req) => {
    const { items } = req.data;

    if (!items || items.length === 0) {
      return req.error(400, "An order must have at least one item");
    }

    const qtyByBook = {};
    for (const it of items) {
      if (!it.book_ID) return req.error(400, "Each item must reference a book");
      if (!it.quantity || it.quantity < 1)
        return req.error(400, "Each item needs a positive quantity");
      qtyByBook[it.book_ID] = (qtyByBook[it.book_ID] || 0) + it.quantity;
    }

    let total = 0;
    for (const [bookID, qty] of Object.entries(qtyByBook)) {
      const book = await cds
        .tx(req)
        .run(SELECT.one.from("my.bookshop.Books").where({ ID: bookID }));
      if (!book) return req.error(404, `Book ${bookID} does not exist`);

      const affected = await cds.tx(req).run(
        UPDATE("my.bookshop.Books")
          .where({ ID: bookID, stock: { ">=": qty } })
          .set({ stock: { "-=": qty } }),
      );

      if (!affected) {
        return req.error(
          400,
          `Not enough stock for book ${bookID}. Requested: ${qty}`,
        );
      }

      for (const it of items.filter((i) => i.book_ID === bookID)) {
        it.priceAtOrder = book.price;
        total += Number(book.price) * it.quantity;
      }
    }

    req.data.totalAmount = total;
  });

  this.after("CREATE", "Orders", async (order, req) => {
    await cds.tx(req).run(
      INSERT.into("my.bookshop.PurchaseLogs").entries({
        order_ID: order.ID,
        message: `Order created with ${req.data.items.length} item(s), total ${req.data.totalAmount}`,
      }),
    );
  });

  this.on("cancelOrder", async (req) => {
    const order = await cds.tx(req).run(
      SELECT.one.from(req.subject).columns((o) => {
        (o.ID,
          o.isCancelled,
          o.items((i) => {
            (i.book_ID, i.quantity);
          }));
      }),
    );

    if (!order) return req.error(404, "Order does not exist");
    if (order.isCancelled) return req.error(400, "Order is already cancelled");

    for (const item of order.items || []) {
      await cds.tx(req).run(
        UPDATE("my.bookshop.Books")
          .where({ ID: item.book_ID })
          .set({ stock: { "+=": item.quantity } }),
      );
    }

    await cds.tx(req).run(UPDATE(req.subject).set({ isCancelled: true }));

    return true;
  });

  this.on("READ", "Suppliers", async (req) => {
    try {
      const bupa = await cds.connect.to("API_BUSINESS_PARTNER");
      return await bupa.run(req.query);
    } catch (error) {
      console.error("Business Partner service failed:", error);
      return req.error(
        502,
        "Business Partner service is currently unavailable",
      );
    }
  });
});
