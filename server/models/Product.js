import mongoose from 'mongoose';
import { isMongoConnected, getFallbackStore, saveFallbackStore } from '../config/db.js';
import { INITIAL_PRODUCTS } from '../data/seedData.js';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true, index: true },
  subCategory: { type: String, required: true, index: true },
  designCategory: { type: String, default: 'Custom Art' },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number, default: null },
  badge: { type: String, default: null },
  image: { type: String, required: true },
  additionalImages: [{ type: String }],
  inStock: { type: Boolean, default: true },
  isSoldOut: { type: Boolean, default: false },
  availableSizes: [{ type: String }],
  availableColors: [{ type: String }],
  isFeatured: { type: Boolean, default: false },
  isCustomizable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 'text', description: 'text', category: 'text', subCategory: 'text' });

export const MongoProduct = mongoose.models.Product || mongoose.model('Product', productSchema);

// Initializer to ensure fallback store has products
function ensureInitialized() {
  const store = getFallbackStore();
  if (!store.products || store.products.length === 0) {
    store.products = [...INITIAL_PRODUCTS];
    saveFallbackStore();
  }
}
ensureInitialized();

export const ProductService = {
  async getAll(query = {}) {
    if (isMongoConnected) {
      const filter = {};
      if (query.category && query.category !== 'All') {
        filter.category = query.category;
      }
      if (query.subCategory && query.subCategory !== 'All') {
        filter.subCategory = query.subCategory;
      }
      if (query.designCategory && query.designCategory !== 'All') {
        filter.designCategory = query.designCategory;
      }
      if (query.isFeatured !== undefined) {
        filter.isFeatured = query.isFeatured === 'true' || query.isFeatured === true;
      }
      if (query.isSoldOut !== undefined) {
        filter.isSoldOut = query.isSoldOut === 'true' || query.isSoldOut === true;
      }
      if (query.inStock !== undefined) {
        filter.inStock = query.inStock === 'true' || query.inStock === true;
      }
      if (query.isCustomizable !== undefined) {
        filter.isCustomizable = query.isCustomizable === 'true' || query.isCustomizable === true;
      }
      if (query.search) {
        const regex = new RegExp(query.search, 'i');
        filter.$or = [{ name: regex }, { description: regex }, { subCategory: regex }, { designCategory: regex }];
      }
      let sort = { createdAt: -1 };
      if (query.sort === 'price_asc') sort = { price: 1 };
      if (query.sort === 'price_desc') sort = { price: -1 };
      if (query.sort === 'newest') sort = { createdAt: -1 };
      if (query.sort === 'featured') sort = { isFeatured: -1, createdAt: -1 };

      return await MongoProduct.find(filter).sort(sort).lean();
    }

    // Fallback store
    ensureInitialized();
    let results = [...getFallbackStore().products];

    if (query.category && query.category !== 'All') {
      results = results.filter(p => p.category.toLowerCase() === query.category.toLowerCase());
    }
    if (query.subCategory && query.subCategory !== 'All') {
      results = results.filter(p => p.subCategory.toLowerCase() === query.subCategory.toLowerCase());
    }
    if (query.designCategory && query.designCategory !== 'All') {
      results = results.filter(p => p.designCategory && p.designCategory.toLowerCase() === query.designCategory.toLowerCase());
    }
    if (query.isFeatured !== undefined) {
      const val = query.isFeatured === 'true' || query.isFeatured === true;
      results = results.filter(p => Boolean(p.isFeatured) === val);
    }
    if (query.isSoldOut !== undefined) {
      const val = query.isSoldOut === 'true' || query.isSoldOut === true;
      results = results.filter(p => Boolean(p.isSoldOut) === val);
    }
    if (query.inStock !== undefined) {
      const val = query.inStock === 'true' || query.inStock === true;
      results = results.filter(p => Boolean(p.inStock) === val);
    }
    if (query.isCustomizable !== undefined) {
      const val = query.isCustomizable === 'true' || query.isCustomizable === true;
      results = results.filter(p => Boolean(p.isCustomizable) === val);
    }
    if (query.search) {
      const term = query.search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(term)) ||
        (p.designCategory && p.designCategory.toLowerCase().includes(term))
      );
    }

    if (query.sort === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (query.sort === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (query.sort === 'newest') {
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (query.sort === 'featured') {
      results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return results;
  },

  async getByIdOrSlug(identifier) {
    if (isMongoConnected) {
      const doc = await MongoProduct.findOne({
        $or: [{ id: identifier }, { slug: identifier }, { _id: mongoose.isValidObjectId(identifier) ? identifier : null }]
      }).lean();
      return doc;
    }

    ensureInitialized();
    return getFallbackStore().products.find(p => p.id === identifier || p.slug === identifier) || null;
  },

  async create(data) {
    const id = data.id || `kala-prod-${Date.now()}`;
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productData = {
      ...data,
      id,
      slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSoldOut: Boolean(data.isSoldOut),
      inStock: data.isSoldOut ? false : (data.inStock !== undefined ? Boolean(data.inStock) : true)
    };

    if (isMongoConnected) {
      const created = await MongoProduct.create(productData);
      return created.toObject();
    }

    const store = getFallbackStore();
    store.products.unshift(productData);
    saveFallbackStore();
    return productData;
  },

  async update(id, updates) {
    updates.updatedAt = new Date().toISOString();
    if (updates.isSoldOut !== undefined) {
      updates.isSoldOut = Boolean(updates.isSoldOut);
      if (updates.isSoldOut) updates.inStock = false;
    }

    if (isMongoConnected) {
      const updated = await MongoProduct.findOneAndUpdate(
        { $or: [{ id }, { slug: id }] },
        { $set: updates },
        { new: true }
      ).lean();
      return updated;
    }

    const store = getFallbackStore();
    const idx = store.products.findIndex(p => p.id === id || p.slug === id);
    if (idx === -1) return null;
    store.products[idx] = { ...store.products[idx], ...updates };
    saveFallbackStore();
    return store.products[idx];
  },

  async delete(id) {
    if (isMongoConnected) {
      await MongoProduct.findOneAndDelete({ $or: [{ id }, { slug: id }] });
      return true;
    }

    const store = getFallbackStore();
    const initialLen = store.products.length;
    store.products = store.products.filter(p => p.id !== id && p.slug !== id);
    saveFallbackStore();
    return store.products.length < initialLen;
  }
};
