/*
 * Used for mongoose(mongodb) queries
 * 1. Filtering documents
 * 2. Sorting results
 * 3. Limiting fields
 * 4. Pagination
*/
module.exports = class QueryUtils {

    constructor(query, queryStringObj) {
        this.query = query;
        this.queryStringObj = queryStringObj;
    }

    // ** Filter query results, ex: ?price[gt]=100&groupSize[lt]=10&difficulty=easy **
    filter(options) {
        // console.log('Filter✌️');
        const fieldsToExclude = ['sort', 'page', 'limit', 'fields', 'password'];
        let filterQuery = {...this.queryStringObj};
        fieldsToExclude.forEach(property => {
            delete filterQuery[property];
        });
        filterQuery = JSON.stringify(filterQuery);
        filterQuery = filterQuery.replace(/^gte|gt|lte|lt$/g, function(match) {
            return `$${match}`;
        });
        filterQuery = JSON.parse(filterQuery);
        this.query.find(filterQuery);
        return this;
    }

    // ** Sort query results, ex: ?sort=a,b,-c **
    sort(defaultSortBy) {
        // console.log('Sort✌️');
        if(this.queryStringObj.sort) {
            const sortBy = this.queryStringObj.sort.split(',').join(' ');
            this.query.sort(sortBy);
        } else {
            this.query.sort(defaultSortBy);
        }
        return this;
    }

    // ** Limit what fields will be returned, ex: ?fields=a,b,-c **
    limit(options) {
        // console.log('Limit✌️');
        if(this.queryStringObj.fields) {
            const fieldsToIncl = this.queryStringObj.fields.split(',').join(' ');
            this.query.select(fieldsToIncl);
        }
        this.query.select('-__v');
        return this;
    }

    // ** Pagination, ex: ?page=2&limit=10 **
    paginate(options = { pageDefault: 1, limitDefault: 10 }) {
        // console.log('Paginate✌️');
        let page = options.pageDefault, limitValue = options.limitDefault;
        if(this.queryStringObj.page)    page = this.queryStringObj.page;
        if(this.queryStringObj.limit)   limitValue = this.queryStringObj.limit;
        const skipValue = (page - 1) * limitValue;
        this.query.skip(skipValue).limit(limitValue);         
        return this;
    }

}