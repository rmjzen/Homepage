try 
{
	// ===== UPDATE Deal's Email_Date_Sent ====
	// The purpose of this code is to clear the "Email Sent Date" field whenever it is called or when the customer clicks it. 
	// This prevents the Follow-Up workflow notification in Zoho CRM from continuing, because the field will be empty. 
	dealID = input.DealID;
	updateDealMap = Map();
	currentDateTime = zoho.currenttime;
	formattedDateTime = currentDateTime.toString("yyyy-MM-dd'T'HH:mm:ss") + "+08:00";
	// ISO 8601 with timezone
	updateDealMap.put("Email_Date_Sent","");
	updateDealResponse = zoho.crm.updateRecord("Deals",dealID.toLong(),updateDealMap);
}
catch (e)
{
	alert "Error" + e.toString();
	// openUrl(productCallToAction, "parent window");
}
try 
{
	// ===== HIDE CREATOR FORM FIELDS =====
	hide DealID;
	hide Selected_Product;
	hide ProductID;
	hide productCTA;
	// ===== INPUT PARAMETERS =====
	dealID = input.DealID;
	productCallToAction = input.productCTA;
	inputSelectedProduct = input.Selected_Product;
	productId = input.ProductID;
	// ===== FETCH PRODUCT RECORD =====
	productRecord = invokeapi
	[
		service :zohocrm
		path :"crm/v7/Products/" + productId
		type :GET
		connection:"zoho_crm"
	];
	selectedProvider = "";
	productCategory = "";
	if(productRecord.get("data") != null && !productRecord.get("data").isEmpty())
	{
		prodData = productRecord.get("data").get(0);
		selectedProvider = ifnull(prodData.get("Provider"),"");
		productCategory = ifnull(prodData.get("Product_Category"),"");
		// Replace 'Provider' with the exact API name of the field
	}
	// ===== FETCH DEAL RECORD =====
	originalDealRecord = invokeapi
	[
		service :zohocrm
		path :"crm/v7/Deals/" + dealID
		type :GET
		connection:"zoho_crm"
	];
	if(originalDealRecord.get("data") == null || originalDealRecord.get("data").isEmpty())
	{
		alert "Deal not found for ID: " + dealID;
		return;
	}
	dealData = originalDealRecord.get("data").get(0);
	// ===== FETCH CONTACT ASSOCIATED WITH DEAL =====
	contactId = dealData.get("Contact_Name").get("id");
	getContact = invokeapi
	[
		service :zohocrm
		path :"crm/v7/Contacts/" + contactId
		type :GET
		connection:"zoho_crm"
	];
	if(getContact.get("data") == null || getContact.get("data").isEmpty())
	{
		alert "Lead NOT created: Contact not found for ID: " + contactId;
		openUrl(productCallToAction,"parent window");
		return;
	}
	contactData = getContact.get("data").get(0);
	firstName = ifnull(contactData.get("First_Name"),"");
	lastName = ifnull(contactData.get("Last_Name"),"");
	email = ifnull(contactData.get("Email"),"");
	// ===== CHECK IF LEAD EXISTS IN CREATOR =====
	creatorDupList = Leads[Deal_ID == dealID && Email == email];
	leadExists = false;
	if(creatorDupList != null && creatorDupList.count() > 0)
	{
		for each  rec in creatorDupList
		{
			if(rec.Selected_Product == inputSelectedProduct)
			{
				leadExists = true;
				break;
			}
		}
	}
	// If lead exists, redirect to Success Page
	if(leadExists)
	{
		encodedCTA = encodeUrl(productCallToAction);
		openUrl("https://creatorapp.zohopublic.com/zohoadmin_moneyherogroup/money-hero/page-perma/Successful_Redirect_Page/GtP6NZZ2sy4bh4X0RYvq2xguu3VRuwaZ99CNWhDFJRz9ZqEefwWFfwQxUvfCdZXNJ3XmxUdYfFNZ8vTO29d7zOqkyYU3aX8FQKPw?cta=" + encodedCTA,"parent window");
		return;
	}
	// ===== PREPARE LEAD MAP FOR CRM =====
	leadMap = Map();
	leadMap.put("First_Name",firstName);
	leadMap.put("Last_Name",lastName);
	leadMap.put("Email",email);
	leadMap.put("Phone",ifnull(dealData.get("Phone"),""));
	leadMap.put("Owner",ifnull(dealData.get("Owner").get("id"),""));
	leadMap.put("Monthly_Income_New_Site",ifnull(dealData.get("Monthly_Income"),""));
	leadMap.put("Annual_Income",ifnull(dealData.get("Annual_Income"),""));
	leadMap.put("Employment_Status",ifnull(dealData.get("Employment_Status"),""));
	leadMap.put("Product_Type",productCategory);
	leadMap.put("Selected_Product",inputSelectedProduct);
	leadMap.put("Selected_Provider",selectedProvider);
	leadMap.put("Selected_Offer",ifnull(dealData.get("Selected_Offer"),""));
	leadMap.put("Has_Existing_CC",ifnull(dealData.get("Has_Existing_CC"),""));
	leadMap.put("Existing_CC_Provider_new","");
	leadMap.put("Card_tenure_new",ifnull(dealData.get("Card_Tenure"),""));
	leadMap.put("Lead_Source","Cross Sell");
	// UTM Fields
	leadMap.put("UtmContent",ifnull(dealData.get("UtmContent"),""));
	leadMap.put("UtmTerm",ifnull(dealData.get("UtmTerm"),""));
	leadMap.put("UtmMedium",ifnull(dealData.get("UtmMedium"),""));
	leadMap.put("UtmChannel",ifnull(dealData.get("UtmChannel"),""));
	leadMap.put("UtmSource",ifnull(dealData.get("UtmSource"),""));
	leadMap.put("UtmCampaign",ifnull(dealData.get("UtmCampaign"),""));
	leadMap.put("UtmStrategy",ifnull(dealData.get("UtmStrategy"),""));
	leadMap.put("scaleo_click_id",ifnull(dealData.get("scaleo_click_id"),""));
	leadMap.put("Marketing_Consent",dealData.get("Marketing_Consent"));
	leadMap.put("Lead_Status","New Lead");
	leadMap.put("Original_Deal",dealID);
	leadMap.put("Original_Selected_Product",ifnull(dealData.get("Selected_Product"),""));
	leadMap.put("Original_Product_Type",ifnull(dealData.get("Product_Type"),""));
	// ===== UPDATE Email_Date_Sent AGAIN (final timestamp) =====
	updateDealMap = Map();
	currentDateTime = zoho.currenttime;
	formattedDateTime = currentDateTime.toString("yyyy-MM-dd'T'HH:mm:ss") + "+08:00";
	updateDealMap.put("Email_Date_Sent",formattedDateTime);
	updateDealResponse = zoho.crm.updateRecord("Deals",dealID.toLong(),updateDealMap);
	// ===== CREATE LEAD IN CREATOR =====
	creatorMap = Map();
	creatorMap.put("Deal_ID",dealID);
	creatorMap.put("Email",email);
	creatorMap.put("Selected_Product",inputSelectedProduct);
	creatorResponse = zoho.creator.createRecord("zohoadmin_moneyherogroup","money-hero","Leads",creatorMap,Map(),"zoho_creator_connection11");
	// ===== CREATE LEAD IN CRM =====
	createLeadResponse = zoho.crm.createRecord("Leads",leadMap);
	alert "Lead Created Successfully";
	// openUrl(productCallToAction,"parent window");
}
catch (e)
{
	alert "Error in Lead Creation || Contact the administrator: " + e.toString();
	// openUrl(productCallToAction, "parent window");
}
