import cds from '@sap/cds'

const {SELECT, UPDATE} = cds.ql;

export default cds.service.impl(function () {

    this.before('READ', 'Books', async req => {
        console.log('Authenticated user:', req.user.id)
        console.log('User roles:', req.user.roles)
    })
    
    this.before('CREATE', 'Orders', async req => {

    const { book_ID, quantity } = req.data

    const book = await cds.tx(req).run(
        SELECT.one
            .from('my.bookshop.Books')
            .where({ ID: book_ID })
    )

    if (!book) {
        return req.error(404, `Book ${book_ID} does not exist`)
    }

    if (book.stock < quantity) {
        return req.error(
            400,
            `Not enough stock for book ${book_ID}. Available: ${book.stock}, requested: ${quantity}`
        )
    }

    await cds.tx(req).run(
        UPDATE('my.bookshop.Books')
            .where({ ID: book_ID })
            .set({ stock: book.stock - quantity })
    )
})

this.on('cancelOrder', async req => {

        const order = await cds.tx(req).run(
            SELECT.one.from(req.subject)
        )
        if (!order) {
            return req.error(404, 'Order does not exist')
        }
        if (order.isCancelled) {
            return req.error(400, 'Order is already cancelled')
        }

        await cds.tx(req).run(
            UPDATE(req.subject).set({ isCancelled: true })
        )

        const book = await cds.tx(req).run(
            SELECT.one
                .from('my.bookshop.Books')
                .where({ ID: order.book_ID })
        )

        if (book) {
            await cds.tx(req).run(
                UPDATE('my.bookshop.Books')
                    .where({ ID: order.book_ID })
                    .set({ stock: book.stock + order.quantity })
            )
        }

        return true
    })

        this.on('READ', 'Suppliers', async req => {
    try {
        const bupa = await cds.connect.to('API_BUSINESS_PARTNER')
        return await bupa.run(req.query)
    } catch (error) {
        console.error('Business Partner service failed:', error)
        return req.error(
            502,
            'Business Partner service is currently unavailable'
        )
    }
})

})