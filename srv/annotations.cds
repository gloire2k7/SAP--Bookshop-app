using CatalogService from './catalog-service';

// ============================================================
// UI annotations for the Books List Report + Object Page
// ============================================================

annotate CatalogService.Books with @(
    UI.SelectionFields: [
        title,
        price,
        stock,
        author_ID
    ],
    UI.LineItem: [
        { Value: title,     Label: '{i18n>bookTitle}'  },
        { Value: author.name, Label: '{i18n>authorName}' },
        { Value: price,     Label: '{i18n>bookPrice}'  },
        { Value: stock,     Label: '{i18n>bookStock}'  }
    ],
    UI.HeaderInfo: {
        TypeName:       '{i18n>Book}',
        TypeNamePlural: '{i18n>Books}',
        Title:          { Value: title },
        Description:    { Value: author.name }
    },
    UI.Identification: [
        { Value: title },
        { Value: author.name },
        { Value: price },
        { Value: stock }
    ],
    UI.Facets: [
        {
            $Type:  'UI.ReferenceFacet',
            Label:  '{i18n>GeneralInfo}',
            Target: '@UI.FieldGroup#General'
        },
        {
            $Type:  'UI.ReferenceFacet',
            Label:  '{i18n>PricingStock}',
            Target: '@UI.FieldGroup#Pricing'
        }
    ],
    UI.FieldGroup #General: {
        Data: [
            { Value: title },
            { Value: author_ID, Label: '{i18n>author}' }
        ]
    },
    UI.FieldGroup #Pricing: {
        Data: [
            { Value: price },
            { Value: stock }
        ]
    }
);

// Explicit value help on Books.author
annotate CatalogService.Books with {
    author @(
        Common: {
            Label: '{i18n>author}',
            ValueList: {
                Label:          '{i18n>authorValueHelp}',
                CollectionPath: 'Authors',
                Parameters: [
                    {
                        $Type:             'Common.ValueListParameterInOut',
                        LocalDataProperty: author_ID,
                        ValueListProperty: 'ID'
                    },
                    {
                        $Type:             'Common.ValueListParameterDisplayOnly',
                        ValueListProperty: 'name'
                    }
                ]
            }
        }
    )
};

// Field-level labels for the other entities too — so the OP for Authors
// and the rest of the app don't show raw field names.
annotate CatalogService.Authors with {
    name @Common.Label: '{i18n>authorName}'
};

annotate CatalogService.Orders with {
    orderDate   @Common.Label: '{i18n>orderDate}';
    totalAmount @Common.Label: '{i18n>totalAmount}';
    isCancelled @Common.Label: '{i18n>isCancelled}'
};

annotate CatalogService.OrderItems with {
    quantity     @Common.Label: '{i18n>quantity}';
    priceAtOrder @Common.Label: '{i18n>priceAtOrder}'
};