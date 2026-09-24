using { managed, cuid } from '@sap/cds/common';

namespace my.bookshop;

entity Authors : managed, cuid {
    name : String;
}

@odata.draft.enabled
entity Books : managed, cuid {
    title  : String  @mandatory;
    price  : Decimal @assert.range: [0, 100000];
    stock  : Integer;
    author : Association to Authors;
}

entity Orders : managed, cuid {
    orderDate   : Timestamp @default: $now;
    totalAmount : Decimal;
    isCancelled : Boolean @default: false;

    items : Composition of many OrderItems on items.order = $self;
}

entity OrderItems : managed, cuid {
    order       : Association to Orders @mandatory;
    book        : Association to Books  @mandatory;
    quantity    : Integer @mandatory @assert.range: [1, 100];
    priceAtOrder: Decimal;
}

entity PurchaseLogs : managed, cuid {
    order   : Association to Orders;
    message : String;
}