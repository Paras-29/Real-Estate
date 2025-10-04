const Lead = require('../models/Lead');
const User = require('../models/User');
const mongoose = require('mongoose');
const { AppError } = require('../middleware/errorHandler');

exports.getLeads = async (req, res, next) => {
  try {
    // All authenticated users can see all leads
    const leads = await Lead.find()
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email phone')
      .populate('reminder.createdBy', 'firstName lastName email');
      
    // Filter reminders to only show those created by the current user
    const leadsWithFilteredReminders = leads.map(lead => {
      const leadObj = lead.toObject();
      // if (leadObj.reminder && leadObj.reminder.createdBy?.toString() !== req.user._id.toString()) {
      //   leadObj.reminder = null;
      // }
      return leadObj;
    });

    res.status(200).json({
      status: 'success',
      data: leadsWithFilteredReminders
    });
  } catch (err) {
    next(err);
  }
};

exports.createLead = async (req, res, next) => {
  try {
    const leadData = {
      ...req.body,
      createdBy: req.user._id
    };
    const lead = await Lead.create(leadData);
    
    // Populate the created and assigned user info
    await lead.populate('createdBy', 'firstName lastName email phone');
    await lead.populate('assignedTo', 'firstName lastName email phone');
    
    res.status(201).json({
      status: 'success',
      data: lead
    });
  } catch (err) {
    next(err);
  }
};

exports.getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email phone')
      .populate('createdBy', 'firstName lastName email phone')
      .populate('reminder.createdBy', 'firstName lastName email');
    
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Convert to object to modify reminder visibility
    const leadObj = lead.toObject();
    
    // Only show reminder if it was created by the current user
    if (leadObj.reminder && leadObj.reminder.createdBy?._id.toString() !== req.user._id.toString()) {
      leadObj.reminder = null;
    }

    res.status(200).json({
      status: 'success',
      data: leadObj
    });
  } catch (err) {
    next(err);
  }
};

exports.updateLead = async (req, res, next) => {
  try {
    const { reminder, commissionSplit, ...updateData } = req.body; // Prevent direct update of reminder and commissionSplit
    
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Permission check: Only creator or admin can update the lead
    if (lead.createdBy.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return next(new AppError('You are not authorized to update this lead', 403));
    }

    // Prevent modification if lead is Closed
    if (lead.status === 'Closed') {
      return next(new AppError('Closed leads cannot be modified', 400));
    }

    // Handle status change to 'Closed' - make sellingPrice and buyerName mandatory
    if (updateData.status === 'Closed') {
      if (!updateData.sellingPrice) {
        return next(new AppError('Selling price is required when closing a lead', 400));
      }
      if (!updateData.buyerName) {
        return next(new AppError("Buyer's name is required when closing a lead", 400));
      }
    }

    // Update the lead document
    Object.assign(lead, updateData);
    await lead.save({
      validateBeforeSave: true,
    });
    
    // Populate the assigned and created user info after update
    await lead.populate('assignedTo', 'firstName lastName email phone');
    await lead.populate('createdBy', 'firstName lastName email phone');

    // Convert to object to modify reminder visibility
    const leadObj = lead.toObject();
    
    // Only show reminder if it was created by the current user
    if (leadObj.reminder && leadObj.reminder.createdBy?._id.toString() !== req.user._id.toString()) {
      leadObj.reminder = null;
    }

    res.status(200).json({
      status: 'success',
      data: leadObj
    });
  } catch (err) {
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return next(new AppError(`Invalid input data: ${errors.join('. ')}`, 400));
    }
    next(err);
  }
};

exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Only allow deletion by the creator or an admin
    if (lead.createdBy.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return next(new AppError('You are not authorized to delete this lead', 403));
    }

    await lead.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.transferLead = async (req, res, next) => {
  try {
    const { newAgentId, commissionSplit } = req.body; // Added commissionSplit
    
    if (!newAgentId) {
      return next(new AppError('New agent ID is required', 400));
    }
    if (!commissionSplit || !commissionSplit.type || !commissionSplit.value) {
      return next(new AppError('Commission split details are required', 400));
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Only allow transfer by the creator of the lead
    if (lead.createdBy.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to transfer this lead', 403));
    }

    // A lead can only be transferred once
    if (lead.isTransferred) {
      return next(new AppError('This lead has already been transferred and cannot be transferred again', 400));
    }

    // Verify the new agent exists and is an agent
    const newAgent = await User.findOne({ 
      _id: newAgentId,
      userType: 'agent'
    });
    
    if (!newAgent) {
      return next(new AppError('Invalid agent ID or user is not an agent', 400));
    }

    // Update the lead with new agent, transfer status, commission split, and history
    lead.assignedTo = newAgentId;
    lead.transferredTo = newAgentId;
    lead.isTransferred = true;
    lead.commissionSplit = commissionSplit; // Set the current commission split
    lead.transferHistory.push({ // Add to transfer history
      transferredTo: newAgentId,
      transferredAt: new Date(),
      commissionSplit: commissionSplit,
      transferredBy: req.user._id,
    });
    lead.lastContacted = new Date();
    await lead.save({
      validateBeforeSave: true,
    });

    // Populate the fields before sending response
    await lead.populate('assignedTo', 'firstName lastName email phone');
    await lead.populate('createdBy', 'firstName lastName email phone');
    await lead.populate('transferHistory.transferredTo', 'firstName lastName email phone'); // Populate transferredTo in history
    await lead.populate('transferHistory.transferredBy', 'firstName lastName email phone'); // Populate transferredBy in history

    // Convert to object to modify reminder visibility
    const leadObj = lead.toObject();
    
    // Only show reminder if it was created by the current user
    if (leadObj.reminder && leadObj.reminder.createdBy?._id.toString() !== req.user._id.toString()) {
      leadObj.reminder = null;
    }

    res.status(200).json({
      status: 'success',
      message: 'Lead transferred successfully',
      data: leadObj
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new AppError('Invalid lead ID or agent ID format', 400));
    }
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return next(new AppError(`Invalid input data: ${errors.join('. ')}`, 400));
    }
    next(err);
  }
};

exports.setReminder = async (req, res, next) => {
  try {
    const { date, message } = req.body;
    
    if (!date || !message) {
      return next(new AppError('Date and message are required for setting a reminder', 400));
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return next(new AppError('Lead not found', 404));
    }

    // Update the lead with reminder and set the creator
    lead.reminder = {
      date: new Date(date),
      message,
      createdBy: req.user._id
    };
    await lead.save();

    // Populate the fields before sending response
    await lead.populate('assignedTo', 'firstName lastName email phone');
    await lead.populate('createdBy', 'firstName lastName email phone');
    await lead.populate('reminder.createdBy', 'firstName lastName email');

    res.status(200).json({
      status: 'success',
      message: 'Reminder set successfully',
      data: lead
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return next(new AppError('Invalid lead ID format', 400));
    }
    next(err);
  }
};

// Update the Lead model to include reminder
const leadSchema = new mongoose.Schema({
  reminder: {
    date: Date,
    message: String
  }
}, {
  timestamps: true
}); 