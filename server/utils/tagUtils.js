const Tag = require('../models/Tag');

/**
 * Efficiently creates or finds tags using bulk operations
 * @param {string[]} tagNames - Array of tag names to create/find
 * @param {string} userId - User ID who owns the tags
 * @returns {Promise<Object[]>} Array of tag objects
 */
const createOrFindTags = async (tagNames, userId) => {
  if (!tagNames || tagNames.length === 0) {
    return [];
  }

  // Normalize tag names
  const normalizedNames = tagNames.map(name => name.trim().toLowerCase());

  // Use bulk operations for better performance
  const tagOperations = normalizedNames.map(name => ({
    updateOne: {
      filter: { name, user: userId },
      update: { $setOnInsert: { name, user: userId } },
      upsert: true
    }
  }));

  // Execute bulk operation
  await Tag.bulkWrite(tagOperations);

  // Fetch the created/updated tags
  const resolvedTags = await Tag.find({ 
    name: { $in: normalizedNames }, 
    user: userId 
  });

  return resolvedTags;
};

module.exports = {
  createOrFindTags
};