'use strict';

const { Contract } = require('fabric-contract-api');

class DistributorChaincode extends Contract {

    async InitLedger(ctx) {
        const products = [
            { ID: 'p1', name: 'Laptop', quantity: 100, price: 1200 },
            { ID: 'p2', name: 'Smartphone', quantity: 200, price: 800 },
        ];
        for (const product of products) {
            await ctx.stub.putState(product.ID, Buffer.from(JSON.stringify(product)));
        }
        console.log('End of genesis block initialization.');
    }

    async AddProduct(ctx, id, name, quantity, price) {
        const product = {
            ID: id,
            name,
            quantity: parseInt(quantity, 10),
            price: parseFloat(price),
        };
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }

    async UpdateProduct(ctx, id, quantity, price) {
        const productAsBytes = await ctx.stub.getState(id);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`Product ${id} does not exist`);
        }
        let product = JSON.parse(productAsBytes.toString());
        product.quantity = parseInt(quantity, 10);
        product.price = parseFloat(price);
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(product)));
        return JSON.stringify(product);
    }

    async GetProduct(ctx, id) {
        const productAsBytes = await ctx.stub.getState(id);
        if (!productAsBytes || productAsBytes.length === 0) {
            throw new Error(`Product ${id} does not exist`);
        }
        return productAsBytes.toString();
    }

    async GetAllProducts(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const resp = result.value;
            allResults.push(JSON.parse(resp.value.toString('utf8')));
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

    async DeleteProduct(ctx, id) {
        const exists = await this.GetProduct(ctx, id);
        if (!exists) {
            throw new Error(`The product ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
        return 'Product successfully deleted';
    }
}

module.exports = DistributorChaincode;
