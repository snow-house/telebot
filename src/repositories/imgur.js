const axios = require('axios');
const FormData = require('form-data');
const config = require('../config');

module.exports = {
  insertImage: async (url) => { 
    const data = new FormData();
    data.append('image', url);
    data.append('type', 'url');
    const req = {
      method: 'post',
      url: `${config.IMGUR_API_BASE_URL}/upload`,
      headers: { 
        'Authorization': `Bearer Client-ID ${config.IMGUR_CLIENT_ID}`, 
        ...data.getHeaders()
      },
      data : data
    };

    try {
      const res = await axios(req);
      return res.data.data.link;
    } catch (error) {
      return "";
    }

  }
};
