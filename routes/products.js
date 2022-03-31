const express = require("express");
const router = express.Router();

const { Product, Brand, SkinType } = require('../models');
const {bootstrapField, createProductForm, createSearchForm } = require('../forms');

const brandDataLayer = require('../dal/brands');
const productDataLayer = require('../dal/products');
const countryDataLayer = require('../dal/countries');
const { checkIfAuthenticated } = require('../middlewares');

router.get('/', checkIfAuthenticated, async function(req,res){
    // let products = await Product.collection().fetch({
    //     withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
    // });

    // get length of brands & countries
    const brands = await brandDataLayer.getAllBrands();
    const countries = await countryDataLayer.getAllCountries();

    console.log(brands.length)

    // for search
    const allBrands = await productDataLayer.getAllBrands();
    allBrands.unshift([0, "N/A"]);
    const allCountries = await productDataLayer.getAllCountries();
    allCountries.unshift([0, "N/A"]);
    const allTypes = await productDataLayer.getAllTypes();
    allTypes.unshift([0, "N/A"]);
    const allStatus = await productDataLayer.getAllStatus();
    allStatus.unshift([0, "N/A"]);

    const searchForm = createSearchForm(allBrands, allCountries, allTypes, allStatus);

    let query = Product.collection();
    searchForm.handle(req,{
        'empty':async function(form){
            let products = await query.fetch({
                withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
            })
            if(req.session.user.role === 1){
                res.render('products/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'products': products.toJSON(),
                    'brands': brands.toJSON(),
                    'countries': countries.toJSON(),
                    'admin':true
                })
            } else{
                res.render('products/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'products': products.toJSON(),
                    'brands': brands.toJSON(),
                    'countries': countries.toJSON()
                })
            }
        },
        'success': async function(form){
            if (form.data.name){
                query.where('name', 'like', '%' + req.query.name + '%')
            }

            // if(form.data.min_cost){
            //     query.where('cost', '>=', form.data.min_cost);
            // }

            // if(form.data.max_cost){
            //     query.where('cost', '<=', form.data.max_cost);
            // }

            if(form.data.brand_id && form.data.brand_id != "0"){
                query.where('brand_id', '=', form.data.brand_id)
            }

            if(form.data.country_id && form.data.country_id != "0"){
                query.where('country_id', '=', form.data.country_id)
            }

            if(form.data.type_id && form.data.type_id != "0"){
                query.where('type_id', '=', form.data.type_id)
            }

            if(form.data.status_id && form.data.status_id != "0"){
                query.where('status_id', '=', form.data.status_id)
            }

            // search the query
            let products = await query.fetch({
                withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
            })


            if(req.session.user.role === 1){
                res.render('products/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'products': products.toJSON(),
                    'brands': brands.toJSON(),
                    'countries': countries.toJSON(),
                    'admin':true
                });
            } else{
                res.render('products/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'products': products.toJSON(),
                    'brands': brands.toJSON(),
                    'countries': countries.toJSON()
                });
            }

        },
        'error':async function(form){
            let products = await query.fetch({
                withRelated:['brand', 'country', 'type', 'skinTypes', 'status']
            })
            if(req.session.user.role === 1){
                res.render('products/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'products': products.toJSON(),
                    'brands': brands.toJSON(),
                    'countries': countries.toJSON(),
                    'admin': true
                })
            } else{
                res.render('products/index',{
                    'searchForm': searchForm.toHTML(bootstrapField),
                    'products': products.toJSON(),
                    'brands': brands.toJSON(),
                    'countries': countries.toJSON()
                })
            }
        }
    })

});

router.get('/create', checkIfAuthenticated, async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();
    const allStatus = await productDataLayer.getAllStatus();

    const productForm = createProductForm(allBrands, allCountries, allTypes, allSkinTypes, allStatus);
    
    if(req.session.user.role === 1){
        res.render('products/create',{
            'form': productForm.toHTML(bootstrapField),
            'cloudinaryName': process.env.CLOUDINARY_NAME,
            'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
            'cloudinaryUploadPreset': process.env.CLOUDINARY_UPLOAD_PRESET,
            'admin':true
        })
    } else{
        res.render('products/create',{
            'form': productForm.toHTML(bootstrapField),
            'cloudinaryName': process.env.CLOUDINARY_NAME,
            'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
            'cloudinaryUploadPreset': process.env.CLOUDINARY_UPLOAD_PRESET
        })
    }
    
});

router.post('/create', checkIfAuthenticated, async function(req,res){

    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();
    const allStatus = await productDataLayer.getAllStatus();

    const productForm = createProductForm(allBrands, allCountries, allTypes, allSkinTypes, allStatus);
    
    productForm.handle(req,{
        'success':async function(form){
            const newProduct = new Product();
            newProduct.set('brand_id', form.data.brand_id);
            newProduct.set('name', form.data.name);
            newProduct.set('country_id', form.data.country_id);
            newProduct.set('type_id', form.data.type_id);
            newProduct.set('cost', form.data.cost);
            newProduct.set('description', form.data.description);
            newProduct.set('ingredients', form.data.sunscreen_filters);
            newProduct.set('expiry', form.data.year_of_expiry);
            newProduct.set('status_id', form.data.status_id);
            newProduct.set('stock_no', form.data.stock_no);
            newProduct.set('image_url', form.data.image_url);
            await newProduct.save();

            // console.log(form.data.skin_types)
            
            if (form.data.skin_types) {
                let selectedSkinTypes = form.data.skin_types.split(',');
                await newProduct.skinTypes().attach(selectedSkinTypes);
            }

            req.flash("success_messages", `New product ${newProduct.get('name')} has been created`);

            res.redirect('/products');
        },
        'error':function(form){
            res.render('products/create',{
                'form':form.toHTML(bootstrapField)
            })
        }
    })
});

router.get('/:product_id/update', checkIfAuthenticated, async function(req,res){

    const productId = req.params.product_id;
    const product = await productDataLayer.getProductByID(productId);
    // const product = await Product.where({
    //     'id':productId
    // }).fetch({
    //     require:true,
    //     withRelated:['country', 'type', 'skinTypes', 'status']
    // })
    
    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();
    const allStatus = await productDataLayer.getAllStatus();

    const productForm = createProductForm(allBrands, allCountries, allTypes, allSkinTypes, allStatus);

    productForm.fields.brand_id.value = product.get('brand_id');
    productForm.fields.name.value = product.get('name');
    productForm.fields.country_id.value = product.get('country_id');
    productForm.fields.type_id.value = product.get('type_id');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');
    productForm.fields.sunscreen_filters.value = product.get('ingredients');
    productForm.fields.year_of_expiry.value = product.get('expiry');
    productForm.fields.status_id.value = product.get('status_id');
    productForm.fields.stock_no.value = product.get('stock_no');
    productForm.fields.image_url.value = product.get('image_url');

    const selectedSkinTypes = await product.related('skinTypes').pluck('id');
    productForm.fields.skin_types.value = selectedSkinTypes;

    if(req.session.user.role === 1){
        res.render('products/update', {
            'form': productForm.toHTML(bootstrapField),
            'product': product.toJSON(),
            'cloudinaryName': process.env.CLOUDINARY_NAME,
            'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
            'cloudinaryUploadPreset': process.env.CLOUDINARY_UPLOAD_PRESET,
            'admin':true
        })
    } else{
        res.render('products/update', {
            'form': productForm.toHTML(bootstrapField),
            'product': product.toJSON(),
            'cloudinaryName': process.env.CLOUDINARY_NAME,
            'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
            'cloudinaryUploadPreset': process.env.CLOUDINARY_UPLOAD_PRESET
        })
    }
    
});

router.post('/:product_id/update', checkIfAuthenticated, async function(req,res){
    
    // const product = await Product.where({
    //     'id': req.params.product_id
    // }).fetch({
    //     require: true,
    //     withRelated:['country','type', 'skinTypes', 'status']
    // })

    const productId = req.params.product_id;
    const product = await productDataLayer.getProductByID(productId);
    
    const allBrands = await productDataLayer.getAllBrands();
    const allCountries = await productDataLayer.getAllCountries();
    const allTypes = await productDataLayer.getAllTypes();
    const allSkinTypes = await productDataLayer.getAllSkinTypes();
    const allStatus = await productDataLayer.getAllStatus();

    const productForm = createProductForm(allBrands, allCountries, allTypes, allSkinTypes, allStatus);
    
    productForm.handle(req,{
        'success':async function(form){
            product.set('brand_id', form.data.brand_id);
            product.set('name', form.data.name);
            product.set('country_id', form.data.country_id);
            product.set('type_id', form.data.type_id);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            product.set('ingredients', form.data.sunscreen_filters);
            product.set('expiry', form.data.year_of_expiry);
            product.set('status_id', form.data.status_id);
            product.set('stock_no', form.data.stock_no);
            product.set('image_url', form.data.image_url);
            // product.set(form.data);
            product.save();

            let skinTypeIds = form.data.skin_types.split(',');
            let existingSkinTypeIds = await product.related('skinTypes').pluck('id');
            
            let toRemove = existingSkinTypeIds.filter( function(id){
                return skinTypeIds.includes(id) === false;
            });
            
            // console.log("toremove=", toRemove);

            await product.skinTypes().detach(toRemove);
            await product.skinTypes().attach(skinTypeIds)

            req.flash("success_messages", `${product.get('name')} has been successfully edited`);

            res.redirect('/products');
        },
        'error':function(form){
            res.render('products/update',{
                'form':form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
});

router.get('/:product_id/delete', checkIfAuthenticated, async function(req,res){

    // const productId = req.params.product_id;
    // const product = await Product.where({
    //     'id':productId
    // }).fetch({
    //     require:true
    // })

    const productId = req.params.product_id;
    const product = await productDataLayer.getProductByID(productId);

    if(req.session.user.role === 1){
        res.render('products/delete', {
            'product': product.toJSON(),
            'admin':true
        })
    } else{
        res.render('products/delete', {
            'product': product.toJSON()
        })
    }
    
});

router.post('/:product_id/delete', checkIfAuthenticated, async function(req,res){

    // const productId = req.params.product_id;
    // const product = await Product.where({
    //     'id':productId
    // }).fetch({
    //     require:true
    // })

    const productId = req.params.product_id;
    const product = await productDataLayer.getProductByID(productId);

    await product.destroy();
    res.redirect('/products');

});

module.exports = router;