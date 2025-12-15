teamFolderId = "0u5zk72b005b13a6b4e5a9b8bf7462c1c1f1f";
currentDate = zoho.currentdate;
recordId = input.ID;
account_owner = "jasbintad2";
app_link_name = "devtac-x-integral-industrial-system";
// -------------------------------
// Get details by record ID
recordDetails = zoho.creator.getRecordById("jasbintad2","devtac-x-integral-industrial-system","All_Maintenances",recordId,"zoho_creator_connection");
dataMap = recordDetails.get("data");

// Step 2: Extract the Customer map
customerMap = dataMap.get("Customer");

// Step 3: Extract fields inside Customer

customerId   = customerMap.get("ID");

customerRecord = invokeapi
[
	service :zohocreator
	path :"creator/v2.1/data/" + account_owner + "/" + app_link_name + "/report/All_Customers/" + customerId
	type :GET
	connection:"zcreatorconn"
];

dataCustomer = customerRecord.get("data");
// info dataCustomer;

customerAdd = dataCustomer.get("Customer_Address");

info customerAdd;


if(recordDetails != null && recordDetails.get("data") != null)
{
	info "Record details successfully retrieved.";
}
else
{
	info "No record details found for this ID.";
}
data = recordDetails.get("data");
valvesList = recordDetails.get("data").get("Valves_Sub_Form");
// info valvesList;
if(valvesList != null && valvesList.size() > 0)
{
	firstValve = valvesList.get(0);
	display = firstValve.get("display_value");
	parts = display.toList(" ");
	realValveId = parts.get(2);
	// This gives 3957183000001502096
}
// info realValveId;
// -------------------------------
// Get the data map
data = recordDetails.get("data");

valveRecord = invokeapi
[
	service :zohocreator
	path :"creator/v2.1/data/" + account_owner + "/" + app_link_name + "/report/All_Valves/" + realValveId
	type :GET
	connection:"zcreatorconn"
];
// info valveRecord;
// Valve Fields
data = valveRecord.get("data");
// info data;
customerName = data.get("Customer_Name").get("Customer_Name");
customerAddress = data.get("Customer_Name.Customer_Contac_Person");
clientLocation = data.get("Customer_Name").get("Location");
// info clientLocation;	
// info customerAddress;
if(recordDetails.get("data").get("Folder_ID") == null || recordDetails.get("data").get("Folder_ID") == "")
{
	createFolder = zoho.workdrive.createFolder("FOLDER - " + recordDetails.get("data").get("Maintenance_Record_No") + " - " + currentDate + "",teamFolderId,"zoho_workdrive_connection");
	subFolderId = createFolder.get("data").getJSON("id");
	folderAttributes = createFolder.get("data").getJSON("attributes");
	// Update folder ID field
	updateMap = Map();
	updateMap.put("Folder_ID",subFolderId);
	// Build WorkDrive folder URL
	folderIdStr = subFolderId.toString();
	folderUrl = "https://workdrive.zoho.com/jeiexdf9ae8edebd44a37b30f1efd965af9f6/teams/jeiexdf9ae8edebd44a37b30f1efd965af9f6/ws/0u5zk72b005b13a6b4e5a9b8bf7462c1c1f1f/folders/" + folderIdStr;
	folderUrl = folderUrl.trim();
	urlMap = Map();
	urlMap.put("url",folderUrl);
	updateMap.put("Url",urlMap);
	updateRecordField = zoho.creator.updateRecord("jasbintad2","devtac-x-integral-industrial-system","All_Maintenances",recordId,updateMap,Map(),"zcreatorconn");
	// 	info updateRecordField;
	folderCreatedTime = folderAttributes.get("created_time");
	currentYear = currentDate.getYear();
	dateString = folderCreatedTime + ", " + currentYear;
	parsedDate = dateString.toDate("MMM dd, hh:mm a, yyyy");
	formattedDate = parsedDate.toString("dd-MMM-yyyy");
	dataMap = Map();
	data = valveRecord.get("data");
	dataMap.put("Location_Client",customerAdd);
	dataMap.put("Location_Address",data.get("Locations").get("Location_Name"));
	dataMap.put("Date",data.get("Date_field"));
	dataMap.put("Valve_Date_Received",data.get("Date_field"));
	dataMap.put("Valve_Location",data.get("Locations").get("Location_Name"));
	dataMap.put("Valve_Certificate_Number",data.get("Certificate_No"));
	dataMap.put("Valve_Tag_Number",data.get("Valve_Tag_No"));
	dataMap.put("Valve_Purchase_Order_Number",data.get("Customer_Work_Order_Purchase_No"));
	dataMap.put("Valve_Service_Reference_Number",data.get("Service_Reference_No"));
	dataMap.put("Valve_Manufacturer",data.get("Manufacturer"));
	dataMap.put("Valve_Model_Number",data.get("Model_Type"));
	dataMap.put("Valve_Serial_Number",data.get("Serial_No"));
	dataMap.put("Valve_Temperature",data.get("Temperature"));
	dataMap.put("Valve_Orifice",data.get("Orifice"));
	dataMap.put("Valve_Seat_Type",data.get("Seat_Type"));
	dataMap.put("Valve_Set_Pressure",data.get("Set_Pressure"));
	dataMap.put("Valve_Capacity",data.get("Capacity"));
	dataMap.put("Over_Pressure",data.get("Over_Pressure"));
	dataMap.put("Valve_Test_Medium",data.get("Test_Medium"));
	dataMap.put("Valve_Cold_Set_Pressure",data.get("Cold_Set_Pressure"));
	dataMap.put("Valve_Leak_Rate",data.get("Leakage_Rate"));
	dataMap.put("Valve_Pretested_Result",data.get("Pre_Pop_Percentage_Test_Result"));
	dataMap.put("Valve_Seat_Tightness_Pressure",data.get("Seat_Tightness_Pressure"));
	dataMap.put("Valve_Leakage_Rate",data.get("Leakage_Rate"));
	dataMap.put("Valve_Back_Pressure",data.get("Back_Pressure"));
	dataMap.put("Valve_Type",data.get("Valve_Type"));
	dataMap.put("As_Found","As Found: No field");
	dataMap.put("As_Left","As Left: No Field");
	dataMap.put("Recommendation","");
	dataMap.put("Tested_Satisfactory",data.get("Leakage_Test_Result") != null);
	dataMap.put("Date_Satisfactory",data.get("Date_field"));
	dataMap.put("Tested_By_Technician",data.get("QC_Approved_By"));
	dataMap.put("Approved_By_Valve",data.get("Witnessing_Authority"));
	dataMap.put("Witnessing_Authority",data.get("Witnessing_Authority"));
	dataMap.put("Certified_Valve_Technician",data.get("QC_Approved_By"));
	dataMap.put("Client_Representative",data.get("Customer_Name"));
	dataMap.put("Approved_By_Valve_Signature","");
	dataMap.put("Tested_By_Technician_Signature","");
	dataMap.put("Client",data.get("Customer_Name"));
	dataMap.put("Address",data.get("Locations").get("Location_Name"));
	dataMap.put("Valve_Purchase_Order_No",data.get("Customer_Work_Order_Purchase_No"));
	dataMap.put("Service_Reference_Number",data.get("Service_Reference_No"));
	dataMap.put("Valve_Calibration_Date",data.get("Test_Gauge_Calibration_Date"));
	dataMap.put("Valve_Instrument_Range",data.get("Test_Gauge_Instrument_Range"));
	dataMap.put("Valve_Leak_Pressure",data.get("Leakage_Test_Result"));
	dataMap.put("Holding_Time","");
	dataMap.put("Result",data.get("Leakage_Test_Result_Unit"));
	outputsettings = Map();
	outputsettings.put("doc_name","Report Generated");
	outputsettings.put("folder_id",subFolderId);
	outputsettings.put("format","pdf");
	outputsettings.put("overwrite_existing_file","true");
	param = Map();
	param.put("merge_data",{"data":dataMap});
	param.put("output_settings",outputsettings);
	response = invokeurl
	[
		url :"https://www.zohoapis.com/writer/api/v2/documents/lzd2me21c348974ad45fcb4fc2cb1c8fea212/merge/store"
		type :POST
		parameters:param
		connection:"zoho_writer_connection"
	];
	info "Report Created Successfully";
}
else
{
	info "Report Already Created";
}
