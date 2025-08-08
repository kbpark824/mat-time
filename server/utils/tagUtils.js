/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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