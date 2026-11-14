const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateProducts() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI must be configured.');
  const applyChanges = process.argv.includes('--apply');
  await mongoose.connect(process.env.MONGODB_URI);

  const products = mongoose.connection.collection('products');
  const cursor = products.find({});
  const operations = [];

  for await (const product of cursor) {
    const set = {};
    if (!Object.prototype.hasOwnProperty.call(product, 'sellerId')) set.sellerId = null;
    if (!Object.prototype.hasOwnProperty.call(product, 'status')) set.status = 'active';
    if (!Object.prototype.hasOwnProperty.call(product, 'trackInventory')) set.trackInventory = false;
    if (!Object.prototype.hasOwnProperty.call(product, 'stockQty')) set.stockQty = null;
    if (!Object.prototype.hasOwnProperty.call(product, 'allowBackorders')) set.allowBackorders = false;
    if (!Object.prototype.hasOwnProperty.call(product, 'currency')) set.currency = 'INR';
    if (!Object.prototype.hasOwnProperty.call(product, 'images')) set.images = product.image ? [product.image] : [];

    if (!Object.prototype.hasOwnProperty.call(product, 'basePrice') && Number.isFinite(product.price) && product.price >= 0) {
      const basePrice = Math.round(product.price * 100);
      if (Number.isSafeInteger(basePrice)) set.basePrice = basePrice;
    }

    if (Object.keys(set).length) {
      operations.push({ updateOne: { filter: { _id: product._id }, update: { $set: set } } });
    }
  }

  console.log(`${operations.length} product record(s) need marketplace fields.`);
  if (!applyChanges) {
    console.log('Dry run only. Review the count, then rerun with --apply to write these non-destructive defaults.');
    return;
  }

  if (operations.length) {
    const result = await products.bulkWrite(operations, { ordered: false });
    console.log(`Updated ${result.modifiedCount} product record(s). Existing product IDs and prices were preserved.`);
  }
}

migrateProducts()
  .catch((error) => {
    console.error('Product migration failed:', error instanceof Error ? error.message : 'Unknown error');
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
