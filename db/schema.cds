using { managed,cuid } from '@sap/cds/common';

namespace my.bookshop;

entity Authors : managed,cuid{
    name   : String;
}

 
entity Books : managed,cuid {
    title      : String @mandatory;
    price      : Decimal @assert.format: 'positive';
    stock      : Integer;
    author     : Association to Authors;
}

entity Orders : managed,cuid{
    quantity    : Integer @mandatory @assert.range: [1,100];
    book        : Association to Books @mandatory;
    isCancelled  : Boolean @default: false;
}
