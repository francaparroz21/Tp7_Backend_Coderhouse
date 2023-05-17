import { productModel } from "../../models/products.model.js"

export class ProductManager{
    async getProducts(limit = 10 , page = 1, query, sort){
        try{

            let modelQuery;
            !query ? (modelQuery = {}) : (modelQuery = { category: query });

            const params = {
                page,
                limit,
                sort: { price: sort }
              }

            const products = await productModel.paginate(
                modelQuery,
                params,
                function(error, result){
                    return result
                }
            )

            products.nextPage = `http://localhost:${process.env.port}/products?page=${products.nextPage}&limit=${limit}`
            products.prevPage = `http://localhost:${process.env.port}/products?page=${products.prevPage}&limit=${limit}`
            
            return { status: 200, response: products }
        }catch(error){
            console.log(`error: ${error}`)
        }
    }

    async getProductById(id){
        try{
            const product = await productModel.findById(id)

            if(!product) return { status: 404, response: "Product not found." }

            return { status: 200, response: product }
        }catch(error){
            console.log(`error: ${error}`)
        }
    }

    async createProduct({ title, description, category, thumbnails, stock, price, code, status }){
        const product = { title, description, category, thumbnails, stock, price, code, status }

        if(!title || !description || !category || !thumbnails || !code) return { status: 400, response: "Bad request." }

        try{
            const productRepeated = await productModel.find({ code: code })

            if(productRepeated) return { status: 400, response: "Product already exists." }

            await productModel.create(product)

            return { status: 200, response: "Product created." }
        }catch(error){
            console.log(`error: ${error}`)
        }
    }

    async updateProduct(id, { title, description, category, thumbnails, stock, price, code, status }){
        try{
            const updateProduct = { title, description, category, thumbnails, stock, price, code, status }
            const productFound = await productModel.findById(id)
            
            if(!productFound) return { status: 404, response: "Product not found." }
            
            const productData = productFound._doc

            const updatedProduct = {
                ...productData,
                ...updateProduct
            }
            await productModel.updateOne({ _id: id }, updatedProduct)

            return { status: 200, response: "Product updated." }
        }catch(error){
            console.log(`error: ${error}`)
        }
    }


    async deleteProduct(id){
        try{
            const productFound = await productModel.findById(id)

            if(!productFound) return { status: 404, ok: false, response: "Product not found." }

            await productModel.deleteOne({ _id: id })

            return { status: 200, response: "Product deleted." }
        }catch(error){
            console.log(`error: ${error}`)
        }
    }

    async deleteAllProducts(){
        try{
            await productModel.deleteMany()

            return { status: 200, response: "All products removed." }
        }catch(error){
            console.log(`error: ${error}`)
        }
    }
}