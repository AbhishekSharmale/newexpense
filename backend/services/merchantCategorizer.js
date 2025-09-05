class MerchantCategorizer {
  static categories = {
    'Food & Dining': {
      keywords: ['zomato', 'swiggy', 'uber eats', 'dominos', 'pizza hut', 'mcdonalds', 'kfc', 'subway', 'starbucks', 'cafe coffee day', 'restaurant', 'hotel', 'dhaba', 'food', 'meal', 'lunch', 'dinner', 'breakfast'],
      merchants: ['ZOMATO', 'SWIGGY', 'UBEREATS', 'DOMINOS', 'PIZZAHUT', 'MCDONALDS', 'KFC', 'SUBWAY', 'STARBUCKS', 'CCD', 'BARBEQUE', 'HALDIRAM']
    },
    
    'Transportation': {
      keywords: ['uber', 'ola', 'rapido', 'auto', 'taxi', 'cab', 'metro', 'bus', 'train', 'flight', 'petrol', 'diesel', 'fuel', 'parking', 'toll', 'fastag'],
      merchants: ['UBER', 'OLA', 'RAPIDO', 'IRCTC', 'SPICEJET', 'INDIGO', 'AIRINDIA', 'BPCL', 'IOCL', 'HPCL', 'SHELL', 'PAYTM FASTAG']
    },
    
    'Shopping': {
      keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'shopping', 'mall', 'store', 'market', 'clothes', 'fashion', 'electronics', 'mobile', 'laptop'],
      merchants: ['AMAZON', 'FLIPKART', 'MYNTRA', 'AJIO', 'NYKAA', 'RELIANCE', 'BIGBAZAAR', 'DMART', 'CROMA', 'VIJAY SALES']
    },
    
    'Entertainment': {
      keywords: ['netflix', 'amazon prime', 'hotstar', 'spotify', 'youtube', 'movie', 'cinema', 'pvr', 'inox', 'game', 'gaming', 'book my show'],
      merchants: ['NETFLIX', 'PRIMEVIDEO', 'HOTSTAR', 'SPOTIFY', 'YOUTUBE', 'PVR', 'INOX', 'BOOKMYSHOW', 'PAYTM MOVIES']
    },
    
    'Utilities': {
      keywords: ['electricity', 'water', 'gas', 'internet', 'broadband', 'mobile', 'recharge', 'postpaid', 'prepaid', 'wifi', 'cable', 'dth'],
      merchants: ['JIO', 'AIRTEL', 'VI', 'BSNL', 'TATASKY', 'DISH TV', 'ADANI GAS', 'MAHANAGAR GAS', 'MSEB', 'BESCOM', 'ACT FIBERNET']
    },
    
    'Healthcare': {
      keywords: ['hospital', 'clinic', 'doctor', 'medical', 'pharmacy', 'medicine', 'apollo', 'fortis', 'max', 'medplus', 'netmeds', 'pharmeasy'],
      merchants: ['APOLLO', 'FORTIS', 'MAX HOSPITAL', 'MEDPLUS', 'NETMEDS', 'PHARMEASY', '1MG']
    },
    
    'Investment': {
      keywords: ['sip', 'mutual fund', 'stock', 'share', 'zerodha', 'groww', 'upstox', 'angel', 'icicidirect', 'hdfcsec'],
      merchants: ['ZERODHA', 'GROWW', 'UPSTOX', 'ANGEL', 'ICICIDIRECT', 'HDFCSEC', 'KOTAKSEC']
    },
    
    'Education': {
      keywords: ['school', 'college', 'university', 'course', 'training', 'coaching', 'tuition', 'byju', 'unacademy', 'vedantu'],
      merchants: ['BYJUS', 'UNACADEMY', 'VEDANTU', 'WHITEHAT JR']
    }
  }

  static categorize(description) {
    const desc = description.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
    
    // Direct merchant match (highest confidence)
    for (const [category, data] of Object.entries(this.categories)) {
      for (const merchant of data.merchants) {
        if (desc.includes(merchant.toLowerCase())) {
          return {
            category,
            confidence: 95,
            method: 'merchant_match',
            matched: merchant
          }
        }
      }
    }
    
    // Keyword match (medium confidence)
    for (const [category, data] of Object.entries(this.categories)) {
      for (const keyword of data.keywords) {
        if (desc.includes(keyword)) {
          return {
            category,
            confidence: 80,
            method: 'keyword_match',
            matched: keyword
          }
        }
      }
    }
    
    // UPI pattern analysis
    const upiMatch = desc.match(/upi[\/\-](.+?)[\/\-]/)
    if (upiMatch) {
      const merchant = upiMatch[1]
      
      // Check if UPI merchant matches known patterns
      for (const [category, data] of Object.entries(this.categories)) {
        for (const knownMerchant of data.merchants) {
          if (merchant.includes(knownMerchant.toLowerCase())) {
            return {
              category,
              confidence: 85,
              method: 'upi_pattern',
              matched: merchant
            }
          }
        }
      }
    }
    
    // Default categorization based on amount patterns
    return this.categorizeByAmount(description)
  }
  
  static categorizeByAmount(description) {
    const amount = Math.abs(parseFloat(description.match(/[\d,]+\.\d{2}/)?.[0]?.replace(/,/g, '') || 0))
    
    // Small amounts likely food/transport
    if (amount < 500) {
      return {
        category: 'Food & Dining',
        confidence: 40,
        method: 'amount_heuristic',
        matched: 'small_amount'
      }
    }
    
    // Medium amounts likely shopping
    if (amount < 5000) {
      return {
        category: 'Shopping',
        confidence: 35,
        method: 'amount_heuristic',
        matched: 'medium_amount'
      }
    }
    
    // Large amounts likely investment/EMI
    return {
      category: 'Investment',
      confidence: 30,
      method: 'amount_heuristic',
      matched: 'large_amount'
    }
  }
  
  static getSubcategory(category, description) {
    const subcategories = {
      'Food & Dining': {
        'zomato|swiggy|uber eats': 'Food Delivery',
        'restaurant|hotel|dhaba': 'Restaurants',
        'starbucks|cafe|coffee': 'Coffee & Tea',
        'grocery|supermarket|dmart': 'Groceries'
      },
      'Transportation': {
        'uber|ola|rapido': 'Ride Share',
        'petrol|diesel|fuel|bpcl|iocl': 'Fuel',
        'metro|bus|train|irctc': 'Public Transport',
        'parking|toll|fastag': 'Parking & Tolls'
      },
      'Shopping': {
        'amazon|flipkart': 'Online Shopping',
        'myntra|ajio|fashion': 'Fashion',
        'electronics|mobile|laptop': 'Electronics',
        'grocery|supermarket': 'Groceries'
      }
    }
    
    const categoryMap = subcategories[category]
    if (!categoryMap) return null
    
    const desc = description.toLowerCase()
    for (const [pattern, subcategory] of Object.entries(categoryMap)) {
      if (new RegExp(pattern).test(desc)) {
        return subcategory
      }
    }
    
    return null
  }
  
  static processTransaction(transaction) {
    const result = this.categorize(transaction.description)
    const subcategory = this.getSubcategory(result.category, transaction.description)
    
    return {
      ...transaction,
      category: result.category,
      subcategory,
      confidence: result.confidence,
      needsReview: result.confidence < 70,
      categorization: {
        method: result.method,
        matched: result.matched
      }
    }
  }
}

module.exports = MerchantCategorizer