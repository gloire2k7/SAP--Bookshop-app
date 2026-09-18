using { my.bookshop as db } from '../db/schema';
using { API_BUSINESS_PARTNER} from './external/API_BUSINESS_PARTNER';

@restrict: [
    { grant: 'READ', to: 'Viewer' },
    { grant: '*', to: 'Admin' }
]
service CatalogService {
    entity Authors as projection on db.Authors;
    entity Books   as projection on db.Books;
    entity Orders  as projection on db.Orders actions{
        action cancelOrder() returns Boolean;
    };
    entity Suppliers as projection on API_BUSINESS_PARTNER.A_BusinessPartner{
        key BusinessPartner as ID,
        BusinessPartnerFullName as Name,
        BusinessPartnerIsBlocked as IsBlocked
    };
}

annotate CatalogService.Books with @title: '{i18n>Books}';
annotate CatalogService.Authors with @title: '{i18n>Authors}';
annotate CatalogService.Orders with @title: '{i18n>Orders}';