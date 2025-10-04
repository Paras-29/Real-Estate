const User = require('../models/User');
const Commission = require('../models/Commission');
const { AppError } = require('../middleware/errorHandler');

// Updated commission levels with new 7% total structure
const commissionLevels = [
  { level: 1, personalCommissionRate: 0.03, teamCommissionRate: 0.00 },  // 3% personal, 0% team
  { level: 2, personalCommissionRate: 0.04, teamCommissionRate: 0.01 },  // 4% personal, 1% team
  { level: 3, personalCommissionRate: 0.05, teamCommissionRate: 0.02 },  // 5% personal, 2% team
  { level: 4, personalCommissionRate: 0.06, teamCommissionRate: 0.03 },  // 6% personal, 3% team
  { level: 5, personalCommissionRate: 0.065, teamCommissionRate: 0.035 }, // 6.5% personal, 3.5% team
  { level: 6, personalCommissionRate: 0.0675, teamCommissionRate: 0.0375 }, // 6.75% personal, 3.75% team
  { level: 7, personalCommissionRate: 0.07, teamCommissionRate: 0.04 }   // 7% personal, 4% team
];

// Helper to get commission rates by level
const getCommissionRates = (level) => {
  const levelData = commissionLevels.find(l => l.level === level);
  if (!levelData) {
    throw new AppError(`Commission level ${level} not found.`, 500);
  }
  return levelData;
};

// Function to calculate and distribute commissions for a single property sale
exports.calculateAndDistributeCommissions = async (propertyId, sellingAgentId) => {
  try {
    const property = await Property.findById(propertyId);
    const sellingAgent = await User.findById(sellingAgentId);

    if (!property || !sellingAgent) {
      throw new AppError('Property or selling agent not found.', 404);
    }
    if (property.status === 'sold') {
      // Prevent double commission if already sold
      return;
    }

    const salePrice = property.price;
    const sellingAgentLevel = sellingAgent.level;
    const { personalCommissionRate, teamCommissionRate } = getCommissionRates(sellingAgentLevel);

    // 1. Calculate selling agent's personal commission
    const personalCommissionAmount = salePrice * personalCommissionRate;

    // Record personal commission
    await Commission.create({
      agent: sellingAgent._id,
      property: property._id,
      company: sellingAgent.companyName,
      amount: personalCommissionAmount,
      type: 'personal',
    });

    // Update selling agent's personal sales metrics
    sellingAgent.personalSalesVolume += salePrice;
    sellingAgent.personalSalesCount += 1;
    await sellingAgent.save();

    // 2. Calculate remaining commission for team distribution
    const totalCommissionRate = 0.07; // 7% total
    const remainingCommissionRate = totalCommissionRate - personalCommissionRate;
    const remainingCommissionAmount = salePrice * remainingCommissionRate;

    if (remainingCommissionAmount > 0) {
      // 3. Distribute remaining commission to upline agents
      await distributeTeamCommissions(sellingAgent, property, remainingCommissionAmount, salePrice);
    }

    // Mark property as sold
    property.status = 'sold';
    property.soldDate = new Date();
    property.soldBy = sellingAgent._id;
    await property.save();

    console.log(`Commissions calculated and distributed for property ${propertyId}`);
  } catch (error) {
    console.error('Error in commission calculation:', error);
    throw new AppError('Failed to calculate commissions.', 500);
  }
};

// Function to distribute team commissions to upline agents
const distributeTeamCommissions = async (sellingAgent, property, remainingAmount, salePrice) => {
  try {
    let currentAgent = sellingAgent;
    const uplineAgents = [];

    // Traverse the referral chain to find all upline agents
    while (currentAgent.referredBy) {
      const uplineAgent = await User.findById(currentAgent.referredBy);
      if (uplineAgent) {
        uplineAgents.push(uplineAgent);
        currentAgent = uplineAgent;
      } else {
        break;
      }
    }

    if (uplineAgents.length === 0) {
      // No upline agents, create company bonus
      await Commission.create({
        agent: sellingAgent._id,
        property: property._id,
        company: sellingAgent.companyName,
        amount: remainingAmount,
        type: 'company_bonus',
      });
      return;
    }

    // Calculate distribution based on the new 7-level structure
    const distribution = calculateTeamCommissionDistribution(uplineAgents, remainingAmount);

    // Distribute commissions to upline agents
    for (const { agent, amount } of distribution) {
      if (amount > 0) {
        await Commission.create({
          agent: agent._id,
          property: property._id,
          company: agent.companyName,
          amount: amount,
          type: 'team_split',
        });

        // Update team sales metrics for upline agents
        agent.teamSalesVolume += salePrice;
        agent.teamSalesCount += 1;
        await agent.save();
      }
    }

    // If there's any remaining amount, create company bonus
    const distributedAmount = distribution.reduce((sum, { amount }) => sum + amount, 0);
    const remainingBonus = remainingAmount - distributedAmount;

    if (remainingBonus > 0) {
      await Commission.create({
        agent: sellingAgent._id,
        property: property._id,
        company: sellingAgent.companyName,
        amount: remainingBonus,
        type: 'company_bonus',
      });
    }
  } catch (error) {
    console.error('Error distributing team commissions:', error);
    throw error;
  }
};

// Function to calculate team commission distribution based on the new structure
const calculateTeamCommissionDistribution = (uplineAgents, remainingAmount) => {
  const distribution = [];
  let remainingPool = remainingAmount;

  // Example distribution logic based on your requirements:
  // When Level 2 sells: Personal 4%, remaining 3% distributed
  // When Level 3 sells: Personal 5%, remaining 2% distributed
  // etc.

  for (let i = 0; i < uplineAgents.length && remainingPool > 0; i++) {
    const agent = uplineAgents[i];
    const agentLevel = agent.level;
    
    // Calculate commission for this upline agent based on their level
    let commissionAmount = 0;

    // Distribution logic based on the new structure
    if (agentLevel === 1) {
      // Level 1 gets 0% team commission
      commissionAmount = 0;
    } else if (agentLevel === 2) {
      // Level 2 gets 1% of remaining pool
      commissionAmount = Math.min(remainingPool * 0.01, remainingPool);
    } else if (agentLevel === 3) {
      // Level 3 gets 1% of remaining pool
      commissionAmount = Math.min(remainingPool * 0.01, remainingPool);
    } else if (agentLevel === 4) {
      // Level 4 gets 1% of remaining pool
      commissionAmount = Math.min(remainingPool * 0.01, remainingPool);
    } else if (agentLevel === 5) {
      // Level 5 gets 0.5% of remaining pool
      commissionAmount = Math.min(remainingPool * 0.005, remainingPool);
    } else if (agentLevel === 6) {
      // Level 6 gets 0.25% of remaining pool
      commissionAmount = Math.min(remainingPool * 0.0025, remainingPool);
    } else if (agentLevel === 7) {
      // Level 7 gets 0.25% of remaining pool
      commissionAmount = Math.min(remainingPool * 0.0025, remainingPool);
    }

    if (commissionAmount > 0) {
      distribution.push({ agent, amount: commissionAmount });
      remainingPool -= commissionAmount;
    }
  }

  return distribution;
};

// Test function to verify commission distribution
exports.testCommissionDistribution = (salePrice, sellingAgentLevel) => {
  const { personalCommissionRate } = getCommissionRates(sellingAgentLevel);
  const personalCommissionAmount = salePrice * personalCommissionRate;
  const totalCommissionRate = 0.07;
  const remainingCommissionAmount = salePrice * (totalCommissionRate - personalCommissionRate);
  
  console.log(`Test Commission Distribution for Level ${sellingAgentLevel}:`);
  console.log(`Sale Price: $${salePrice.toLocaleString()}`);
  console.log(`Personal Commission (${(personalCommissionRate * 100)}%): $${personalCommissionAmount.toLocaleString()}`);
  console.log(`Remaining for Team Distribution: $${remainingCommissionAmount.toLocaleString()}`);
  console.log(`Total Commission (7%): $${(salePrice * totalCommissionRate).toLocaleString()}`);
  
  return {
    salePrice,
    personalCommissionAmount,
    remainingCommissionAmount,
    totalCommission: salePrice * totalCommissionRate
  };
}; 