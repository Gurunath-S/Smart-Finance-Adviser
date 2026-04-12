const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Income = require('./models/IncomeModel');
const Expense = require('./models/ExpenseModel'); // Assuming ExpenseModel exists

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      maxPoolSize: 10,
    });
    console.log('Connected to MongoDB for seeding');

    // Clear existing for a clean state
    await User.deleteMany({});
    await Income.deleteMany({});
    await Expense.deleteMany({});

    // Create a demo user
    const user = new User({
      username: 'demouser',
      email: 'demo@example.com',
      password: 'password123'
    });
    const savedUser = await user.save();
    console.log(`Created User: ${savedUser.username}`);

    const userId = savedUser._id.toString();

    // Create default income
    const income1 = new Income({
      title: 'Salary',
      amount: 5000,
      type: 'income',
      date: new Date(),
      category: 'salary',
      description: 'Monthly salary',
      userId: userId
    });
    const income2 = new Income({
      title: 'Freelance',
      amount: 1500,
      type: 'income',
      date: new Date(Date.now() - 86400000 * 5),
      category: 'freelancing',
      description: 'Web development freelance',
      userId: userId
    });
    await income1.save();
    await income2.save();
    console.log('Created Income records');

    // Create default expenses
    const expense1 = new Expense({
      title: 'Groceries',
      amount: 400,
      type: 'expense',
      date: new Date(Date.now() - 86400000 * 2),
      category: 'groceries',
      description: 'Weekly groceries',
      userId: userId
    });
    const expense2 = new Expense({
      title: 'Rent',
      amount: 1200,
      type: 'expense',
      date: new Date(Date.now() - 86400000 * 10),
      category: 'rent',
      description: 'Monthly rent',
      userId: userId
    });
    await expense1.save();
    await expense2.save();
    console.log('Created Expense records');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
