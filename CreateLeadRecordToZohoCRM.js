try 
{
	dealID = input.DealID;
	updateDealMap = Map();
	// Use current date and time
	updateDealMap = Map();
	currentDateTime = zoho.currenttime;
	// current datetime
	// Build ISO 8601 with colon in timezone
	formattedDateTime = currentDateTime.toString("yyyy-MM-dd'T'HH:mm:ss") + "+08:00";
	// adjust offset if needed
	updateDealMap.put("Email_Date_Sent","");
	updateDealResponse = zoho.crm.updateRecord("Deals",dealID.toLong(),updateDealMap);
}
catch (e)
{
	alert "Error" + e.toString();
	//     openUrl(productCallToAction, "parent window");
}
try 
{
	// Hide fields 
	hide DealID;
	hide Selected_Product;
	hide ProductID;
	hide productCTA;
	// Params
	dealID = input.DealID;
	productCallToAction = input.productCTA;
	inputSelectedProduct = input.Selected_Product;
	// 	==== FETCH PRODUCT RECORD
	productId = input.ProductID;
	// Fetch the product record
	productRecord = invokeapi
	[
		service :zohocrm
		path :"crm/v7/Products/" + productId
		type :GET
		connection:"zoho_crm"
	];
	selectedProvider = "";
	if(productRecord.get("data") != null && !productRecord.get("data").isEmpty())
	{
		prodData = productRecord.get("data").get(0);
		selectedProvider = ifnull(prodData.get("Provider"),"");
		productCategoy = ifnull(prodData.get("Product_Category"),"");
		// Replace 'Provider' with the exact API name of the field
	}
	// ==== FETCH DEAL RECORD ====
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
	// ----------- Contact Fields --------------
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
	// ==== CHECK IF LEAD EXISTS FOR THIS DEAL + PRODUCT + EMAIL ====
	criteria = "(Original_Deal:equals:" + dealID + ")";
	existingLeads = zoho.crm.searchRecords("Leads",criteria,1,200,{"approved":"both"},"zoho_crm");
	leadExists = false;
	if(existingLeads != null && !existingLeads.isEmpty())
	{
		for each  rec in existingLeads
		{
			existingProduct = ifnull(rec.get("Selected_Product"),"");
			existingLeadEmail = ifnull(rec.get("Email"),"");
			// Only block if SAME PRODUCT AND SAME EMAIL
			if(existingProduct == inputSelectedProduct && existingLeadEmail == email && email != "")
			{
				leadExists = true;
				break;
			}
		}
	}
	if(leadExists)
	{
		// Encode the product CTA so it can be passed in the URL
		encodedCTA = encodeUrl(productCallToAction);
		// Open your custom page and pass the CTA as a parameter
		openUrl("https://creatorapp.zohopublic.com/zohoadmin_moneyherogroup/money-hero/page-perma/Successful_Redirect_Page/GtP6NZZ2sy4bh4X0RYvq2xguu3VRuwaZ99CNWhDFJRz9ZqEefwWFfwQxUvfCdZXNJ3XmxUdYfFNZ8vTO29d7zOqkyYU3aX8FQKPw?cta=" + encodedCTA,"parent window");
		return;
	}
	// ----------- Lead Map ----------------
	leadMap = Map();
	leadMap.put("First_Name",firstName);
	leadMap.put("Last_Name",lastName);
	leadMap.put("Email",email);
	leadMap.put("Phone",ifnull(dealData.get("Phone"),""));
	leadMap.put("Owner",ifnull(dealData.get("Owner").get("id"),""));
	leadMap.put("Monthly_Income_New_Site",ifnull(dealData.get("Monthly_Income"),""));
	leadMap.put("Annual_Income",ifnull(dealData.get("Annual_Income"),""));
	leadMap.put("Employment_Status",ifnull(dealData.get("Employment_Status"),""));
	leadMap.put("Product_Type",ifnull(prodData.get("Product_Category"),""));
	leadMap.put("Selected_Product",inputSelectedProduct);
	//     leadMap.put("Selected_Provider", ifnull(dealData.get("Selected_Provider"), ""));
	leadMap.put("Selected_Provider",selectedProvider);
	leadMap.put("Selected_Offer",ifnull(dealData.get("Selected_Offer"),""));
	leadMap.put("Has_Existing_CC",ifnull(dealData.get("Has_Existing_CC"),""));
	leadMap.put("Existing_CC_Provider_new","");
	// default empty if null
	leadMap.put("Card_tenure_new",ifnull(dealData.get("Card_Tenure"),""));
	leadMap.put("Lead_Source","Cross Sell");
	// UTMs
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
	// ===== CREATE LEAD =====
	createLeadResponse = zoho.crm.createRecord("Leads",leadMap);
	alert "Lead Created Successfully.";
	// ===== CREATE LEAD =====
	// ===== UPDATE Email_Date_Sent in the Deal =====
	// ===== UPDATE Email_Date_Sent in the Deal =====
	updateDealMap = Map();
	// Use current date and time
	updateDealMap = Map();
	currentDateTime = zoho.currenttime;
	// current datetime
	// Build ISO 8601 with colon in timezone
	formattedDateTime = currentDateTime.toString("yyyy-MM-dd'T'HH:mm:ss") + "+08:00";
	// adjust offset if needed
	updateDealMap.put("Email_Date_Sent",formattedDateTime);
	updateDealResponse = zoho.crm.updateRecord("Deals",dealID.toLong(),updateDealMap);
	// Optionally open the product CTA
	openUrl(productCallToAction,"parent window");
}
catch (e)
{
	alert "Error in Lead Creation || Contact the administrator: " + e.toString();
	//     openUrl(productCallToAction, "parent window");
}


// version
Version 89.6
05-Dec-2025 14:41:49
zohotest1_moneyherogroup13