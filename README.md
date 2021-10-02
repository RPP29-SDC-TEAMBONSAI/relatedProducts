# relatedProducts
relatedProducts service



ProductOverview endpoint for Related Products:

  I will send an array of product Id's - I will need the following for each. This should be able to be done in 1 query - I know for postgres it just means adding an in operator.

  - Name
  - Category
  - Original Price
  - Sale Price
  - Photo urls -- array of photo and thumbnail photo (full size first, thumbnail second)

  ForEach ID, I would need this layout (potentially send back an array of objects)
  {
    productId:
    name:
    category:
    originalPrice:
    salePrice:
    photos: [url1, url2]
  }




Reviews endpoints for Related Products:

  I will send an array of product Id's - I will need the following for each. This should be able to be done in 1 query - I know for postgres it just means adding an in operator.

  - Average of all ratings for each ID

  ForEach ID, I would need this layout (potentially send back an array of objects)
  {
    productID:
    overallRating:
  }


/api/related{id}

- query params: id

- receives only 1 product Id at a time.
- expected response will be the required data for the related products and features for the current product

/api/addRelated{id, ids to add to existing}

/api/deleteRelated{id, ids to delete from existing}
