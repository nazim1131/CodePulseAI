const axios = require('axios');
const User = require('../models/User');

const getRepoFiles = async (userId, owner, repo, branch = 'main') => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    // This is a naive implementation fetching the subtree directly (for demo/mock purposes it can be limited)
    // We fetch a recursive tree
    const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, {
      headers: { 
        Authorization: `Bearer ${user.accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    return treeRes.data.tree;
  } catch (error) {
    console.error('Error fetching tree:', error.message);
    // fallback empty tree
    return [];
  }
};

const getFileContent = async (userId, owner, repo, filePath) => {
  try {
    const user = await User.findById(userId);
    const contentRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
      headers: { 
        Authorization: `Bearer ${user.accessToken}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });
    
    // content is base64 encoded
    return Buffer.from(contentRes.data.content, 'base64').toString('utf8');
  } catch (error) {
    console.error('Error fetching file content:', error.message);
    return "";
  }
};

module.exports = { getRepoFiles, getFileContent };
