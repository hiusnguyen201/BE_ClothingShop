/** @type {import('#src/app/products/models/product.model')} */

import { faker } from '@faker-js/faker';
import { categories } from '#src/database/data/categories-data';
import { options } from '#src/database/data/options-data';
import { PRODUCT_STATUS } from '#src/app/products/products.constant';
import { newProductVariantsRepository } from '#src/app/product-variants/product-variants.repository';
import { newProductRepository } from '#src/app/products/products.repository';

const cartesianProduct = (arrays) => {
  return arrays.reduce(
    (acc, curr) => acc.map((x) => curr.map((y) => [...x, y])).reduce((acc, curr) => acc.concat(curr), []),
    [[]],
  );
};

const parentCategories = categories.filter((cat) => cat.level === 1);
const subCategories = categories.filter((cat) => cat.level === 2);

export const products = [];
export const variants = [];

Array.from({ length: 50 }).map(() => {
  const name = faker.commerce.productName();

  const category = faker.helpers.arrayElement(parentCategories);
  const subCategoryOptions = subCategories.filter((sub) => sub.parent?.toString() === category._id.toString());

  const subCategory = subCategoryOptions.length > 0 ? faker.helpers.arrayElement(subCategoryOptions) : null;
  const status = faker.helpers.arrayElement(Object.values(PRODUCT_STATUS));

  const newProduct = newProductRepository({
    thumbnail: faker.image.urlPicsumPhotos(),
    name: name.slice(0, 150),
    description: generateHtmlDescription(),
    status: status,
    category: category._id,
    subCategory: subCategory?._id ?? null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  });

  const numOptions = faker.number.int({ min: 2, max: 2 });
  const selectedOptions = faker.helpers.shuffle(options).slice(0, numOptions);

  const productOptions = selectedOptions.map((opt) => {
    const selectedValues = faker.helpers.arrayElements(
      opt.optionValues.map((v) => v._id),
      {
        min: 1,
        max: 3,
      },
    );
    return {
      option: opt._id,
      optionValues: selectedValues,
    };
  });

  newProduct.productOptions = productOptions;

  const optionValuesCombinations = cartesianProduct(
    productOptions.map((opt) => opt.optionValues.map((valueId) => ({ option: opt.option, optionValue: valueId }))),
  );

  const newListVariants = optionValuesCombinations.map((optionValues) => {
    const price = faker.number.int({ min: 99, max: 199 });
    const sku = faker.string.alphanumeric(10).toUpperCase();
    const quantity = faker.number.int({ min: 0, max: 100 });

    const newVariant = newProductVariantsRepository({
      sku,
      price: price * 1000,
      quantity,
      sold: faker.number.int({ min: 0, max: 50 }),
      variantValues: optionValues,
      product: newProduct._id,
    });

    variants.push(newVariant);

    return newVariant;
  });

  newProduct.productVariants = newListVariants.map((variant) => variant._id);

  products.push(newProduct);
});

function generateHtmlDescription() {
  const productDescription = faker.commerce.productDescription();

  // Tạo mô tả HTML giống Shopee
  const htmlDescription = `
    <div>
      <!-- Hình ảnh sản phẩm -->
      <div style="text-align: center;">
        <img src="${faker.image.urlPicsumPhotos(
          600,
          400,
          'fashion',
        )}" alt="Product Image" style="width: 100%; max-width: 400px;"/>
      </div>
      
      <!-- Tên sản phẩm và mô tả ngắn -->
      <h1 style="color: #333; font-size: 24px; font-weight: bold;">${faker.commerce.productName()}</h1>
      <p style="color: #666; font-size: 14px;">${productDescription}</p>

      <!-- Các tính năng nổi bật -->
      <h2 style="font-size: 18px; color: #444; font-weight: bold;">Tính Năng Nổi Bật:</h2>
      <ul style="color: #555; list-style-type: disc; padding-left: 20px;">
        <li><strong>Chất liệu cao cấp:</strong> Tăng độ bền và sự thoải mái.</li>
        <li><strong>Thiết kế hiện đại:</strong> Phù hợp với mọi phong cách.</li>
        <li><strong>Dễ dàng bảo quản:</strong> Có thể giặt máy và bảo quản dễ dàng.</li>
        <li><strong>Đa dạng màu sắc và kích cỡ:</strong> Chọn lựa theo sở thích của bạn.</li>
      </ul>

      <!-- Thông số kỹ thuật -->
      <h2 style="font-size: 18px; color: #444; font-weight: bold;">Thông Số Kỹ Thuật:</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Màu Sắc</th>
          <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">Đen, Trắng, Xanh, Đỏ</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Chất Liệu</th>
          <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">100% Cotton</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Kích Cỡ</th>
          <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">S, M, L, XL</td>
        </tr>
        <tr>
          <th style="text-align: left; padding: 8px; border: 1px solid #ddd;">Trọng Lượng</th>
          <td style="text-align: left; padding: 8px; border: 1px solid #ddd;">300g</td>
        </tr>
      </table>

      <!-- Lợi ích của sản phẩm -->
      <h2 style="font-size: 18px; color: #444; font-weight: bold;">Lợi Ích Sản Phẩm:</h2>
      <ul style="color: #555; list-style-type: disc; padding-left: 20px;">
        <li><strong>Được làm từ chất liệu cao cấp,</strong> mang lại sự thoải mái khi mặc.</li>
        <li><strong>Thiết kế phù hợp với mọi đối tượng,</strong> dễ dàng kết hợp với nhiều trang phục khác nhau.</li>
        <li><strong>Giá thành hợp lý,</strong> phù hợp với túi tiền của đa số khách hàng.</li>
        <li><strong>Giúp bạn tự tin hơn,</strong> nâng tầm phong cách sống.</li>
      </ul>

      <!-- Hướng dẫn bảo quản -->
      <h2 style="font-size: 18px; color: #444; font-weight: bold;">Hướng Dẫn Bảo Quản:</h2>
      <p style="color: #555; font-size: 14px;">Giặt máy với nhiệt độ nước lạnh, không tẩy trắng, sấy nhẹ ở nhiệt độ thấp để giữ màu sắc sản phẩm lâu dài.</p>

      <!-- Đánh giá sản phẩm -->
      <h2 style="font-size: 18px; color: #444; font-weight: bold;">Đánh Giá Sản Phẩm:</h2>
      <p style="font-size: 14px; color: #555;">"Sản phẩm tuyệt vời! Chất liệu mềm mại và thoải mái. Đúng như mô tả trên website. Tôi rất hài lòng!" - Ngọc Mai</p>
      <p style="font-size: 14px; color: #555;">"Chất lượng tuyệt vời và giao hàng nhanh chóng. Mua rất đáng đồng tiền!" - Quang Hieu</p>

      <!-- Khuyến khích mua hàng -->
      <p style="font-size: 16px; font-weight: bold; color: #f44336;">Đặt mua ngay để nhận ưu đãi giảm giá đặc biệt!</p>
    </div>
  `;

  return htmlDescription;
}
