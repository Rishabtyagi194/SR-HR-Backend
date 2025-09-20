// import subscriptionCategoryModel from '../models/subscriptionPlan.model.js';
import companyModel from '../models/company.model.js';
import employerUserModel from '../models/employerUser.model.js';
// import paymentModel from '../models/payment.model.js';
// import SubscriptionModel from '../models/subscription.model.js';
// import Razorpay from 'razorpay';

// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// STEP 1 Employer chooses plan & enters company + admin details

export const createCompanyAndAdmin = async (req, res) => {
  try {
    const { companyData, userData } = req.body;

    // Create company
    const company = await companyModel.create(companyData);

    // Create employer admin
    const employerUser = await employerUserModel.create({
      ...userData,
      companyId: company._id,
      role: 'employer_admin',
    });

    // Attach admin to company
    company.adminUserId = employerUser._id;
    await company.save();

    return res.status(201).json({
      message: 'Company and employer admin created successfully',
      company,
      employerUser,
    });
  } catch (err) {
    console.error('createCompanyAndAdmin error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const {
      isActive,
      name,
      adminUserId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // case-insensitive search
    }

    if (adminUserId) {
      query.adminUserId = adminUserId;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { [sortBy]: order === 'asc' ? 1 : -1 },
      populate: { path: 'adminUserId', select: 'name email phone role isActive' },
    };

    // Pagination logic
    const skip = (options.page - 1) * options.limit;

    const [companies, total] = await Promise.all([
      companyModel
        .find(query)
        .populate(options.populate)
        .sort(options.sort)
        .skip(skip)
        .limit(options.limit),
      companyModel.countDocuments(query),
    ]);

    return res.status(200).json({
      message: 'Companies fetched successfully',
      count: companies.length,
      total,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      companies,
    });
  } catch (err) {
    console.error('getAllCompanies error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// STEP 2 - Create Razorpay order for payment
// export const createPaymentOrder = async (req, res) => {
//   try {
//     const { companyId, planSlug, categorySlug } = req.body;

//     // Find plan
//     const category = await subscriptionCategoryModel.findOne({ slug: categorySlug });
//     if (!category) return res.status(404).json({ message: 'Category not found' });

//     const plan = category.plans.find((p) => p.slug === planSlug && p.isActive);
//     if (!plan) return res.status(404).json({ message: 'Plan not found' });

//     const amountCents = plan.price * 100; // convert to paise

//     // Create Razorpay order
//     const order = await razorpay.orders.create({
//       amount: amountCents,
//       currency: plan.currency,
//       receipt: `receipt_${Date.now()}`,
//     });

//     // Save payment record
//     const payment = await paymentModel.create({
//       companyId,
//       amountCents,
//       currency: plan.currency,
//       provider: 'razorpay',
//       providerPaymentId: order.id,
//       status: 'pending',
//       metadata: { planSlug, categorySlug },
//     });

//     return res.json({ order, payment });
//   } catch (err) {
//     console.error('createPaymentOrder error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// STEP 3 - Handle Razorpay webhook → confirm payment + activate subscription

// export const handleRazorpayWebhook = async (req, res) => {
//   try {
//     const payload = req.body;

//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

//     // Find payment
//     const payment = await paymentModel.findOne({ providerPaymentId: razorpay_order_id });
//     if (!payment) return res.status(404).json({ message: 'Payment record not found' });

//     //  Ideally verify signature here with crypto
//     // Skipping for brevity, but you should do:
//     // const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     //   .update(orderId + "|" + paymentId).digest("hex");

//     // Update payment status
//     payment.status = 'succeeded';
//     payment.metadata.paymentId = razorpay_payment_id;
//     await payment.save();

//     // Find plan
//     const { planSlug, categorySlug } = payment.metadata;
//     const category = await subscriptionCategoryModel.findOne({ slug: categorySlug });
//     const plan = category.plans.find((p) => p.slug === planSlug);

//     // Create subscription
//     const startDate = new Date();
//     const endDate = new Date(startDate.getTime() + plan.validityDays * 24 * 60 * 60 * 1000);

//     const subscription = await SubscriptionModel.create({
//       companyId: payment.companyId,
//       plan: { categoryId: category._id, planSlug: plan.slug },
//       status: 'active',
//       startDate,
//       endDate,
//       billingCycle: 'one_time',
//       metadata: {
//         jobLocationLimit: plan.jobLocationLimit,
//         jobApplyLimit: plan.jobApplyLimit,
//         features: plan.features,
//       },
//     });

//     return res.json({ message: 'Subscription activated', subscription });
//   } catch (err) {
//     console.error('handleRazorpayWebhook error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// **********************************************************************

// import subscriptionCategoryModel from '../models/subscriptionPlan.model.js';
// import companyModel from '../models/company.model.js';
// import employerUserModel from '../models/employerUser.model.js';
// import paymentModel from '../models/payment.model.js';
// import SubscriptionModel from '../models/subscription.model.js';
// // import Razorpay from 'razorpay';

// // const razorpay = new Razorpay({
// //   key_id: process.env.RAZORPAY_KEY_ID,
// //   key_secret: process.env.RAZORPAY_KEY_SECRET,
// // });

// // STEP 1 Employer chooses plan & enters company + admin details

// export const createCompanyAndAdmin = async (req, res) => {
//   try {
//     const { companyData, userData, planSlug, categorySlug, billingCycle = 'one_time' } = req.body;

//     // 1. Find plan
//     const category = await subscriptionCategoryModel.findOne({
//       slug: categorySlug,
//       isActive: true,
//     });
//     if (!category) return res.status(404).json({ message: 'Category not found' });

//     const plan = category.plans.find((p) => p.slug === planSlug && p.isActive);
//     if (!plan) return res.status(404).json({ message: 'Plan not found' });

//     // 2. Create company
//     const company = await companyModel.create(companyData);

//     // while creating employer admin
//     const employerUser = await employerUserModel.create({
//       ...userData,
//       companyId: company._id,
//       role: 'employer_admin',
//       permissions: plan.features, // assign permissions from plan
//     });

//     // Attach admin to company
//     company.adminUserId = employerUser._id;
//     await company.save();

//     // attach permission to employer
//     employerUser.permissions = plan.features || [];
//     await employerUser.save();

//     // 4. Create subscription record (sold plan)
//     const startDate = new Date();
//     const endDate = new Date(startDate);
//     endDate.setDate(endDate.getDate() + (plan.validityDays || 30)); // fallback 30 days

//     // clone date for billing calculation
//     let nextBillingDate = endDate;
//     if (billingCycle === 'monthly') {
//       nextBillingDate = new Date(startDate);
//       nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
//     } else if (billingCycle === 'yearly') {
//       nextBillingDate = new Date(startDate);
//       nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
//     }

//     const subscription = await SubscriptionModel.create({
//       companyId: company._id,
//       plan: {
//         categoryId: category._id,
//         planSlug: plan.slug,
//         name: plan.name,
//         price: plan.price,
//         currency: plan.currency,
//         validityDays: plan.validityDays,
//         jobLocationLimit: plan.jobLocationLimit,
//         jobApplyLimit: plan.jobApplyLimit,
//         features: plan.features,
//       },
//       billingCycle,
//       startDate,
//       endDate,
//       nextBillingDate,
//       status: 'active',
//     });

//     return res.status(201).json({
//       message: 'Company, employer admin, and subscription created',
//       company,
//       employerUser,
//       subscription,
//     });
//   } catch (err) {
//     console.error('createCompanyAndAdmin error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // STEP 2 - Create Razorpay order for payment
// export const createPaymentOrder = async (req, res) => {
//   try {
//     const { companyId, planSlug, categorySlug } = req.body;

//     // Find plan
//     const category = await subscriptionCategoryModel.findOne({ slug: categorySlug });
//     if (!category) return res.status(404).json({ message: 'Category not found' });

//     const plan = category.plans.find((p) => p.slug === planSlug && p.isActive);
//     if (!plan) return res.status(404).json({ message: 'Plan not found' });

//     const amountCents = plan.price * 100; // convert to paise

//     // Create Razorpay order
//     const order = await razorpay.orders.create({
//       amount: amountCents,
//       currency: plan.currency,
//       receipt: `receipt_${Date.now()}`,
//     });

//     // Save payment record
//     const payment = await paymentModel.create({
//       companyId,
//       amountCents,
//       currency: plan.currency,
//       provider: 'razorpay',
//       providerPaymentId: order.id,
//       status: 'pending',
//       metadata: { planSlug, categorySlug },
//     });

//     return res.json({ order, payment });
//   } catch (err) {
//     console.error('createPaymentOrder error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// // STEP 3 - Handle Razorpay webhook → confirm payment + activate subscription

// export const handleRazorpayWebhook = async (req, res) => {
//   try {
//     const payload = req.body;

//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

//     // Find payment
//     const payment = await paymentModel.findOne({ providerPaymentId: razorpay_order_id });
//     if (!payment) return res.status(404).json({ message: 'Payment record not found' });

//     //  Ideally verify signature here with crypto
//     // Skipping for brevity, but you should do:
//     // const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     //   .update(orderId + "|" + paymentId).digest("hex");

//     // Update payment status
//     payment.status = 'succeeded';
//     payment.metadata.paymentId = razorpay_payment_id;
//     await payment.save();

//     // Find plan
//     const { planSlug, categorySlug } = payment.metadata;
//     const category = await subscriptionCategoryModel.findOne({ slug: categorySlug });
//     const plan = category.plans.find((p) => p.slug === planSlug);

//     // Create subscription
//     const startDate = new Date();
//     const endDate = new Date(startDate.getTime() + plan.validityDays * 24 * 60 * 60 * 1000);

//     const subscription = await SubscriptionModel.create({
//       companyId: payment.companyId,
//       plan: { categoryId: category._id, planSlug: plan.slug },
//       status: 'active',
//       startDate,
//       endDate,
//       billingCycle: 'one_time',
//       metadata: {
//         jobLocationLimit: plan.jobLocationLimit,
//         jobApplyLimit: plan.jobApplyLimit,
//         features: plan.features,
//       },
//     });

//     return res.json({ message: 'Subscription activated', subscription });
//   } catch (err) {
//     console.error('handleRazorpayWebhook error:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };
