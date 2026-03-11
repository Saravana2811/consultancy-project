import express from 'express';
import Chat from '../models/Chat.js';
import Material from '../models/Material.js';

const router = express.Router();

// Get or create chat for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    let chat = await Chat.findOne({ userId, status: 'active' });
    
    if (!chat) {
      // Get materials count for welcome message
      const materialsCount = await Material.countDocuments({ isActive: true });
      
      chat = new Chat({
        userId,
        userName: req.query.userName || 'User',
        messages: [{
          sender: 'admin',
          text: `வணக்கம்! 👋 எங்கள் டெக்ஸ்டைல் ​​விற்பனை மையத்திற்கு வரவேற்கிறோம்!\n\n🎉 தற்போது ${materialsCount} வகையான துணிகள் கிடைக்கின்றன\n\nநீங்கள் கேட்கலாம்:\n• விலை விவரங்கள்\n• கையிருப்பு நிலை\n• தயாரிப்பு வகைகள்\n• டெலிவரி விவரங்கள்\n\nஎதைப் பற்றி தெரிந்து கொள்ள விரும்புகிறீர்கள்?`,
          timestamp: new Date(),
          read: false
        }]
      });
      await chat.save();
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/message', async (req, res) => {
  try {
    const { userId, userName, text, sender } = req.body;
    
    let chat = await Chat.findOne({ userId, status: 'active' });
    
    if (!chat) {
      const materialsCount = await Material.countDocuments({ isActive: true });
      
      chat = new Chat({
        userId,
        userName,
        messages: [{
          sender: 'admin',
          text: `வணக்கம்! 👋 எங்கள் டெக்ஸ்டைல் ​​விற்பனை மையத்திற்கு வரவேற்கிறோம்!\n\n🎉 தற்போது ${materialsCount} வகையான துணிகள் கிடைக்கின்றன\n\nநீங்கள் கேட்கலாம்:\n• விலை விவரங்கள்\n• கையிருப்பு நிலை\n• தயாரிப்பு வகைகள்\n• டெலிவரி விவரங்கள்\n\nஎதைப் பற்றி தெரிந்து கொள்ள விரும்புகிறீர்கள்?`,
          timestamp: new Date(),
          read: false
        }]
      });
    }
    
    chat.messages.push({
      sender,
      text,
      timestamp: new Date()
    });
    
    chat.lastMessageAt = new Date();
    
    // Auto-reply for user messages
    if (sender === 'user') {
      const lowerText = text.toLowerCase();
      let autoReply = null;
      
      // Fetch materials for context-aware responses
      const materials = await Material.find({ isActive: true });
      const categories = [...new Set(materials.map(m => m.category).filter(Boolean))];
      const availableMaterials = materials.filter(m => m.quantity > 0);
      
      // Greetings
      if (lowerText.includes('வணக்கம்') || lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey')) {
        autoReply = `வணக்கம்! 🙏 எங்கள் டெக்ஸ்டைல் ​​விற்பனை மையத்திற்கு வரவேற்கிறோம். தற்போது ${materials.length} வகையான துணிகள் கிடைக்கின்றன. எதைப் பற்றி அறிய விரும்புகிறீர்கள்?`;
      }
      
      // Categories
      else if (lowerText.includes('categories') || lowerText.includes('வகை') || lowerText.includes('types') || lowerText.includes('என்ன என்ன')) {
        if (categories.length > 0) {
          autoReply = `எங்களிடம் பின்வரும் வகைகள் உள்ளன:\n\n${categories.map(c => `📦 ${c}`).join('\n')}\n\nஎந்த வகையைப் பார்க்க விரும்புகிறீர்கள்?`;
        } else {
          autoReply = 'தற்போது வகைகள் கிடைக்கவில்லை.';
        }
      }
      
      // Price queries
      else if (lowerText.includes('விலை') || lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('rate')) {
        if (materials.length > 0) {
          const minPrice = Math.min(...materials.map(m => m.price));
          const maxPrice = Math.max(...materials.map(m => m.price));
          const topProducts = materials.slice(0, 3);
          
          autoReply = `எங்கள் தயாரிப்புகள் Rs.${minPrice} முதல் Rs.${maxPrice} வரை விலையில் கிடைக்கின்றன.\n\n🔥 சிறந்த தயாரிப்புகள்:\n${topProducts.map(p => `• ${p.title}: Rs.${p.price} ${p.quantity > 0 ? '✅ கிடைக்கிறது' : '❌ இல்லை'}`).join('\n')}`;
        } else {
          autoReply = 'தற்போது தயாரிப்புகள் கிடைக்கவில்லை.';
        }
      }
      
      // Stock/Availability
      else if (lowerText.includes('கிடைக்குமா') || lowerText.includes('available') || lowerText.includes('stock') || lowerText.includes('இருக்கா')) {
        if (availableMaterials.length > 0) {
          const stockList = availableMaterials.slice(0, 5);
          autoReply = `✅ தற்போது ${availableMaterials.length} தயாரிப்புகள் கையிருப்பில் உள்ளன:\n\n${stockList.map(p => `📦 ${p.title}\n   விலை: Rs.${p.price}\n   கையிருப்பு: ${p.quantity} யூனிட்கள்`).join('\n\n')}`;
        } else {
          autoReply = '❌ தற்போது கையிருப்பில் எதுவும் இல்லை. விரைவில் மீண்டும் கையிருப்பில் சேர்க்கப்படும்.';
        }
      }
      
      // Budget/Cheap options
      else if (lowerText.includes('cheap') || lowerText.includes('குறைந்த') || lowerText.includes('lowest') || lowerText.includes('budget') || lowerText.includes('மலிவு')) {
        if (materials.length > 0) {
          const cheapest = materials.sort((a, b) => a.price - b.price).slice(0, 3);
          autoReply = `💰 குறைந்த விலை தயாரிப்புகள்:\n\n${cheapest.map((p, i) => `${i + 1}. ${p.title}\n   Rs.${p.price}\n   ${p.quantity > 0 ? `✅ ${p.quantity} யூனிட்கள் கிடைக்கிறது` : '❌ கையிருப்பில் இல்லை'}`).join('\n\n')}`;
        }
      }
      
      // Premium/Expensive
      else if (lowerText.includes('expensive') || lowerText.includes('premium') || lowerText.includes('best quality') || lowerText.includes('சிறந்த')) {
        if (materials.length > 0) {
          const premium = materials.sort((a, b) => b.price - a.price).slice(0, 3);
          autoReply = `⭐ பிரீமியம் தயாரிப்புகள்:\n\n${premium.map((p, i) => `${i + 1}. ${p.title}\n   Rs.${p.price}\n   ${p.quantity > 0 ? `✅ ${p.quantity} யூனிட்கள் கிடைக்கிறது` : '❌ கையிருப்பில் இல்லை'}`).join('\n\n')}`;
        }
      }
      
      // Delivery/Shipping
      else if (lowerText.includes('டெலிவரி') || lowerText.includes('delivery') || lowerText.includes('shipping') || lowerText.includes('நாள்') || lowerText.includes('எப்போது')) {
        autoReply = '🚚 டெலிவரி விவரங்கள்:\n\n• டெலிவரி நேரம்: 3-5 வேலை நாட்கள்\n• இலவச டெலிவரி Rs.1000க்கு மேல்\n• எல்லா இந்திய மாநிலங்களுக்கும்\n• வேகமான டெலிவரி விருப்பம் உண்டு\n\nஉங்கள் பகுதிக்கு டெலிவரி கிடைக்குமா என்பதை உறுதிப்படுத்த அட்மினை தொடர்பு கொள்ளவும்.';
      }
      
      // Payment methods
      else if (lowerText.includes('payment') || lowerText.includes('செலுத்த') || lowerText.includes('pay') || lowerText.includes('கட்டண')) {
        autoReply = '💳 கட்டண முறைகள்:\n\n✅ கிரெடிட்/டெபிட் கார்டு\n✅ UPI கட்டணம் (PhonePe, GPay, Paytm)\n✅ நெட் பேங்கிங்\n✅ வீட்டில் பணம் செலுத்தும் முறை (COD)\n\nபாதுகாப்பான மற்றும் எளிதான கட்டணம்!\n\nCOD Rs.500 க்கு மேல் மட்டுமே கிடைக்கும்.';
      }
      
      // Order/How to buy
      else if (lowerText.includes('order') || lowerText.includes('வாங்க') || lowerText.includes('buy') || lowerText.includes('purchase') || lowerText.includes('எப்படி')) {
        autoReply = '🛒 ஆர்டர் செய்வது எப்படி?\n\n1️⃣ தயாரிப்புகளைப் பார்க்கவும்\n2️⃣ உங்களுக்கு பிடித்ததை தேர்வு செய்யவும்\n3️⃣ "Buy Now" அழுத்தவும்\n4️⃣ உங்கள் விவரங்களை நிரப்பவும்\n5️⃣ கட்டணம் செலுத்தவும்\n\n✅ உங்கள் ஆர்டர் உறுதிப்படுத்தப்பட்டது!\n\nஏதேனும் சந்தேகம் இருந்தால் நிர்வாகியிடம் கேளுங்கள்.';
      }
      
      // Return/Refund
      else if (lowerText.includes('return') || lowerText.includes('refund') || lowerText.includes('exchange') || lowerText.includes('திரும்ப') || lowerText.includes('மாற்று')) {
        autoReply = '🔄 திரும்ப அளிப்பு/மாற்று கொள்கை:\n\n• 7 நாட்களுக்குள் திரும்ப அளிப்பு\n• தயாரிப்பு பயன்படுத்தப்படாததாக இருக்க வேண்டும்\n• அசல் பேக்கேஜிங் தேவை\n• மாற்று அல்லது பணம் திரும்ப\n\nதயவுசெய்து அட்மினை தொடர்பு கொண்டு திரும்ப அளிப்பு செயல்முறையை தொடங்கவும்.';
      }
      
      // Discount/Offers
      else if (lowerText.includes('discount') || lowerText.includes('offer') || lowerText.includes('sale') || lowerText.includes('தள்ளுபடி') || lowerText.includes('சலுகை')) {
        autoReply = '🎁 தற்போதைய சலுகைகள்:\n\n💰 Rs.1000க்கு மேல் இலவச டெலிவரி\n🎉 பல தயாரிப்புகளுக்கு சிறப்பு விலை\n📦 மொத்த ஆர்டருக்கு தள்ளுபடி\n\nஅதிக சலுகைகளுக்கு எங்கள் தயாரிப்புகளைப் பார்க்கவும் அல்லது அட்மினிடம் கேளுங்கள்!';
      }
      
      // Bulk/Wholesale
      else if (lowerText.includes('bulk') || lowerText.includes('wholesale') || lowerText.includes('மொத்த') || lowerText.includes('அதிக') || lowerText.includes('பெரிய')) {
        autoReply = '📦 மொத்த ஆர்டர் விவரங்கள்:\n\n• மொத்த ஆர்டருக்கு சிறப்பு விலை\n• 50 யூனிட்களுக்கு மேல்: 10% தள்ளுபடி\n• 100 யூனிட்களுக்கு மேல்: 15% தள்ளுபடி\n• கஸ்டமைஸ் செய்யப்பட்ட பேக்கேஜிங் கிடைக்கும்\n\nமொத்த ஆர்டர் விலைக்கு அட்மினுடன் பேசவும்.';
      }
      
      // Quality/Material
      else if (lowerText.includes('quality') || lowerText.includes('material') || lowerText.includes('fabric') || lowerText.includes('தரம்') || lowerText.includes('துணி')) {
        autoReply = '⭐ தர உத்தரவாதம்:\n\n✅ 100% தரமான துணிகள்\n✅ நீடித்த பொருட்கள்\n✅ வண்ண நிலைத்தன்மை\n✅ தர சோதனை செய்யப்பட்டது\n\nஒவ்வொரு தயாரிப்பிலும் விவரங்கள் கொடுக்கப்பட்டுள்ளன. குறிப்பிட்ட தயாரிப்பைப் பற்றி கேளுங்கள்!';
      }
      
      // Size/Measurement
      else if (lowerText.includes('size') || lowerText.includes('measurement') || lowerText.includes('அளவு') || lowerText.includes('சைஸ்')) {
        autoReply = '📏 அளவு விவரங்கள்:\n\n• ஒவ்வொரு தயாரிப்பிலும் அளவு குறிப்பிடப்பட்டுள்ளது\n• துணி அகலம் மற்றும் நீளம் கொடுக்கப்பட்டுள்ளது\n• கஸ்டம் அளவுகள் கிடைக்கும்\n\nகுறிப்பிட்ட தயாரிப்பின் அளவுக்கு அட்மினிடம் கேளுங்கள்!';
      }
      
      // Color options
      else if (lowerText.includes('color') || lowerText.includes('colour') || lowerText.includes('வண்ணம்') || lowerText.includes('நிறம்')) {
        autoReply = '🎨 வண்ண விருப்பங்கள்:\n\n• பல வண்ணங்களில் கிடைக்கும்\n• விளக்கம் மற்றும் படங்களில் வண்ணம் காட்டப்பட்டுள்ளது\n• உண்மையான வண்ணம் சற்று வேறுபடலாம்\n\nகுறிப்பிட்ட வண்ணத்தைப் பற்றி அட்மினிடம் கேளுங்கள்!';
      }
      
      // Care/Washing instructions
      else if (lowerText.includes('wash') || lowerText.includes('care') || lowerText.includes('clean') || lowerText.includes('துவை') || lowerText.includes('பராமரி')) {
        autoReply = '🧺 பராமரிப்பு குறிப்புகள்:\n\n• குளிர்ந்த நீரில் துவைக்கவும்\n• லேசான சோப்பு பயன்படுத்தவும்\n• நேரடி சூரிய ஒளியில் உலர வைக்காதீர்கள்\n• தேவைப்பட்டால் இரும்பு செய்யவும்\n\nஒவ்வொரு துணிக்கும் குறிப்பிட்ட பராமரிப்பு முறைகள் உண்டு!';
      }
      
      // Contact/Location
      else if (lowerText.includes('contact') || lowerText.includes('location') || lowerText.includes('address') || lowerText.includes('தொடர்பு') || lowerText.includes('முகவரி')) {
        autoReply = '📍 எங்களை தொடர்பு கொள்ள:\n\n📞 இந்த சாட்டில் செய்தி அனுப்பவும்\n🌐 எங்கள் கடை முழுவதும் ஆன்லைன்\n🚚 இந்தியா முழுவதும் டெலிவரி\n\nமேலும் விவரங்களுக்கு அட்மினை தொடர்பு கொள்ளவும்!';
      }
      
      // Timing/Working hours
      else if (lowerText.includes('time') || lowerText.includes('hours') || lowerText.includes('open') || lowerText.includes('நேரம்') || lowerText.includes('திறந்து')) {
        autoReply = '🕒 சேவை நேரம்:\n\n• ஆன்லைன் ஸ்டோர்: 24/7 கிடைக்கும்\n• சாட் ஆதரவு: காலை 9 முதல் இரவு 9 வரை\n• ஆர்டர்கள்: எப்போதும் ஏற்றுக்கொள்ளப்படும்\n\nஎந்த நேரத்திலும் ஆர்டர் செய்யலாம்!';
      }
      
      // Recommendation requests
      else if (lowerText.includes('suggest') || lowerText.includes('recommend') || lowerText.includes('பரிந்துரை') || lowerText.includes('சிபாரிசு')) {
        if (materials.length > 0) {
          const recommended = materials.filter(m => m.quantity > 0).slice(0, 3);
          autoReply = `💡 எங்கள் பரிந்துரைகள்:\n\n${recommended.map((p, i) => `${i + 1}. ${p.title}\n   விலை: Rs.${p.price}\n   கையிருப்பு: ${p.quantity} யூனிட்கள்`).join('\n\n')}\n\nமேலும் விவரங்களுக்கு கேளுங்கள்!`;
        }
      }
      
      // Preparation/Manufacturing process
      else if (lowerText.includes('தயாரிப்பு படி') || lowerText.includes('preparation') || lowerText.includes('manufacturing') || 
               lowerText.includes('எப்படி தயாரி') || lowerText.includes('process') || lowerText.includes('செயல்முறை') || 
               lowerText.includes('how made') || lowerText.includes('படிகள்')) {
        autoReply = `🏭 துணி தயாரிப்பு செயல்முறை:\n\n1️⃣ பருத்தி தேர்வு\n   • தரமான பருத்தி கொள்முதல்\n   • தர சோதனை\n\n2️⃣ நூல் உற்பத்தி\n   • பருத்தியை நூலாக மாற்றுதல்\n   • நூல் வலிமை பரிசோதனை\n\n3️⃣ துணி நெசவு\n   • அதிநவீன நெசவு இயந்திரங்கள்\n   • துல்லியமான வடிவமைப்பு\n\n4️⃣ சாயமிடுதல் & அச்சிடுதல்\n   • பாதுகாப்பான சாயங்கள்\n   • வண்ண நிலைத்தன்மை சோதனை\n\n5️⃣ முடித்தல் செயல்முறை\n   • இஸ்திரி மற்றும் மெருகூட்டல்\n   • தர கட்டுப்பாடு\n\n6️⃣ பேக்கேஜிங்\n   • சுத்தமான பேக்கேஜிங்\n   • போக்குவரத்துக்கு தயார்\n\n✅ ஒவ்வொரு படியிலும் தர உத்தரவாதம்!\n\nகுறிப்பிட்ட தயாரிப்பு செயல்முறையைப் பற்றி மேலும் அறிய அட்மினை தொடர்பு கொள்ளவும்.`;
      }
      
      // Search for specific product names
      else if (materials.some(m => lowerText.includes(m.title.toLowerCase()))) {
        const matchedProduct = materials.find(m => lowerText.includes(m.title.toLowerCase()));
        if (matchedProduct) {
          autoReply = `📦 ${matchedProduct.title}\n\n${matchedProduct.description || 'தரமான துணி தயாரிப்பு'}\n\n💰 விலை: Rs.${matchedProduct.price}\n📊 கையிருப்பு: ${matchedProduct.quantity > 0 ? `${matchedProduct.quantity} யூனிட்கள் ✅` : 'கையிருப்பில் இல்லை ❌'}\n🏷️ வகை: ${matchedProduct.category || 'பொதுவான'}\n\nவாங்க விரும்புகிறீர்களா? இப்போதே ஆர்டர் செய்யலாம்!`;
        }
      }
      
      // Help menu
      else if (lowerText.includes('உதவி') || lowerText.includes('help') || lowerText.includes('?')) {
        autoReply = `🤝 நாங்கள் உங்களுக்கு உதவ இங்கே!\n\nநீங்கள் கேட்கலாம்:\n• தயாரிப்புகள் மற்றும் விலைகள்\n• கையிருப்பு நிலை\n• ஆர்டர் செய்வது எப்படி\n• டெலிவரி மற்றும் கட்டண முறைகள்\n• திரும்ப அளிப்பு/மாற்று\n• தள்ளுபடி மற்றும் சலுகைகள்\n• தர விவரங்கள்\n• அளவு மற்றும் வண்ணங்கள்\n\nஎதைப் பற்றி தெரிந்து கொள்ள விரும்புகிறீர்கள்?`;
      }
      
      // Thank you
      else if (lowerText.includes('நன்றி') || lowerText.includes('thank')) {
        autoReply = `உங்களுக்கு வரவேற்கிறோம்! 😊\n\nஎங்கள் ${materials.length} தயாரிப்புகளை பாருங்கள் மற்றும் இன்றே ஆர்டர் செய்யுங்கள்!\n\nமேலும் உதவி தேவைப்பட்டால் கேளுங்கள்!`;
      }
      
      // Default intelligent fallback
      else {
        // Try to understand what they're asking about
        if (lowerText.includes('?') || lowerText.includes('என்ன') || lowerText.includes('எப்படி') || lowerText.includes('எங்கே') || lowerText.includes('யார்')) {
          autoReply = `உங்கள் கேள்விக்கு நன்றி! 🤔\n\nநான் இன்னும் கற்றுக்கொண்டிருக்கிறேன். நீங்கள் இவற்றைப் பற்றி கேட்கலாம்:\n\n💰 விலை மற்றும் தயாரிப்புகள்\n📦 கையிருப்பு நிலை\n🚚 டெலிவரி விவரங்கள்\n💳 கட்டண முறைகள்\n🔄 திரும்ப அளிப்பு கொள்கை\n🎁 சலுகைகள்\n\nஅல்லது எங்கள் அட்மின் விரைவில் உங்களுக்கு பதிலளிப்பார்!`;
        } else {
          autoReply = `உங்கள் செய்தி பெறப்பட்டது! ⏳\n\nநான் உங்களுக்கு உதவ முயற்சிக்கிறேன். நீங்கள் கேட்கலாம்:\n\n📝 "விலை என்ன?" - விலை பார்க்க\n📦 "கிடைக்குமா?" - கையிருப்பு பார்க்க\n🏷️ "வகைகள்" - எல்லா வகைகளும் பார்க்க\n🚚 "டெலிவரி" - டெலிவரி விவரங்கள்\n🛒 "எப்படி வாங்குவது" - ஆர்டர் செயல்முறை\n🎁 "தள்ளுபடி" - சலுகைகள்\n💳 "கட்டணம்" - கட்டண முறைகள்\n\nஎங்கள் அட்மின் குழுவும் விரைவில் பதிலளிக்கும்!`;
        }
      }
      
      if (autoReply) {
        chat.messages.push({
          sender: 'admin',
          text: autoReply,
          timestamp: new Date(),
          read: false
        });
      }
    }
    
    await chat.save();
    
    res.json(chat);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all chats (for admin)
router.get('/all', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ lastMessageAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/:chatId/read', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    chat.messages.forEach(msg => {
      if (msg.sender === 'admin') {
        msg.read = true;
      }
    });
    
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
