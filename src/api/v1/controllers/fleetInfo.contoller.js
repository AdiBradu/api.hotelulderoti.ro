const query = require('../db/db-connection');
const DBFleetInfoModel = require('../models/fleetInfo.model');
const FleetInfoModel = new DBFleetInfoModel(query);
const DBVehicleModel = require('../models/vehicle.model');
const VehicleModel = new DBVehicleModel(query);
const DBUserModel = require('../models/user.model');
const UserModel = new DBUserModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const excel = require("exceljs");
const Role = require('../utils/userRoles.utils');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();


class FleetInfoController {

  getAllFleets = async (req, res, next) => {

    if(req.session.userRole === 1) {      
      let fleetData = await FleetInfoModel.countAllFleets(req.query.searchString, req.query.region, req.query.healthScore);
      let fleetList = await FleetInfoModel.getAllFleets(req.query.page, req.query.limit, req.query.searchString, req.query.region, req.query.healthScore);
      if(!fleetList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
      res.send({fleetData, fleetList});
    } else if(req.session.userRole === 2) {
      let fleetData = await FleetInfoModel.countAgentFleets(req.session.userId, req.query.searchString, req.query.region, req.query.healthScore);      
      let fleetList = await FleetInfoModel.getAgentFleets(req.session.userId, req.query.page, req.query.limit, req.query.searchString, req.query.region, req.query.healthScore);
      if(!fleetList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
      res.send({fleetData, fleetList});
    } else if(req.session.userRole === 5) {
      let fleetData = await FleetInfoModel.countAllFleets(req.query.searchString, req.query.region, req.query.healthScore);
      let fleetList = await FleetInfoModel.getAllHotelFleets(req.query.page, req.query.limit, req.query.searchString, req.query.region, req.query.healthScore);
      if(!fleetList.length) {
        throw new HttpException(404, 'Nici o flota gasita');
      }
      res.send({fleetData, fleetList});
    }
    
  }

  fleetsToExcel = async (req, res, next) => {
    let fleets = [];
    let queryCount = Math.ceil(parseInt(req.query.totalFleets) / 5000);    
    for (let i = 0; i < queryCount; i++) {
      let fleetList;
      if(req.session.userRole === 1) {             
        fleetList = await FleetInfoModel.getAllFleets(i, 5000, req.query.searchString, req.query.region, req.query.healthScore);
      } else if(req.session.userRole === 2) {              
        fleetList = await FleetInfoModel.getAgentFleets(req.session.userId, i, 5000, req.query.searchString, req.query.region, req.query.healthScore);
      } else if(req.session.userRole === 5) {       
        fleetList = await FleetInfoModel.getAllHotelFleets(i, 5000, req.query.searchString, req.query.region, req.query.healthScore);       
      }        
      if(fleetList.length){
        fleetList.forEach((f) => {
          let tireHealthScore = f.tiresCount !== 0 ? Math.ceil((f.excessiveUsageTires * 1 + f.mediumUsageTires * 2 + f.noUsageTires * 3) / (f.tiresCount * 3)*100) : 0;
          fleets.push({
            denumire: f.fleet_name,
            judet: f.fleet_region,
            vehicule: f.vehiclesCount,
            anvelope: f.tiresCount,
            healthscore: tireHealthScore
          });
        });
      }
    }    
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Portofoliu anvelope");

    worksheet.columns = [
      { header: "Denumire", key: "denumire", width: 30 },
      { header: "Judet", key: "judet", width: 25 },
      { header: "Vehicule", key: "vehicule", width: 25 },
      { header: "Anvelope", key: "anvelope", width: 20 },
      { header: "Health Score", key: "healthscore", width: 20 },
    ];
    worksheet.addRows(fleets);
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {      
      cell.font = {
        bold: true,
      };
    })
    //Commit the changed row to the stream
    headerRow.commit();   
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "Export portofoliu anvelope.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  }

  getFleetById = async (req, res, next) => {
    let fleet
    if(req.session.userRole === 1) {
      let searchParams = [req.params.id];
      fleet = await FleetInfoModel.search(`fi_id = ? `, searchParams);
    } else if(req.session.userRole === 2) {
      let searchParams = [req.session.userId, req.params.id];
      fleet = await FleetInfoModel.agentSearch(` AND fleet_info.fi_id = ? `, searchParams);      
    } else if(req.session.userRole === 5) {
      let searchParams = [req.params.id];
      fleet = await FleetInfoModel.hotelSearch(`fi_id = ? `, searchParams);
    }

    if(!fleet || !fleet.length) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(fleet);
  }

  getWithUserDataByFleetId = async (req, res, next) => {
    let fleet
    if(req.session.userRole === 1) {     
      fleet = await FleetInfoModel.getWithUserDataByFleetId(req.params.id);
    } else if(req.session.userRole === 2) {      
      fleet = await FleetInfoModel.agentGetWithUserDataByFleetId(req.session.userId, req.params.id);
    } 

    if(!fleet) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(fleet);
  }

  getFleetByUserId = async (req, res, next) => {
    let fleet
    if(req.session.userRole !== 3) {
      throw new HttpException(401, 'Acces interzis');
    }

    let searchParams = [req.session.userId];      
    fleet = await FleetInfoModel.search(`user_id = ?`, searchParams);

    if(!fleet || !fleet.length) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(fleet);
  }


  getOwnDetails = async (req, res, next) => {
    const fleet = await FleetInfoModel.getWithUserDataByUId(req.session.userId);
    if(!fleet) {
      throw new HttpException(404, 'Flota nu a fost gasita');
    }
    res.send(fleet);
  }


  getFleetByName = async (req, res, next) => {
    const fleet = await FleetInfoModel.findOne({fleet_name: req.params.fleet_name});
    if(!fleet) {
      throw new HttpException(404, 'Flota nu a fost gasita');
    }
    res.send(fleet);
  }

  searchFleets = async (req, res, next) => {

    let searchParams = [`${String(req.query.search)}%`];

    let fleetList = await FleetInfoModel.search(`fleet_name LIKE ? `, searchParams);
    
    if(fleetList.length > 0){
      
      let fleetVehiclesList = await VehicleModel.find({fleet_id: fleetList[0].fi_id});

      fleetList = {...fleetList, fleetVehiclesList};
      
    }
  
    res.send(fleetList);    
  }


  filterFleets = async (req, res, next) => {
    let searchParams = [];
    let customSearchString=``;

    if(String(req.query.region) !== "") {
      searchParams = [...searchParams, String(req.query.region)];
      customSearchString += ` fleet_region = ? `;
    }
    
    if(searchParams.length < 1) {
      searchParams.push(1);  
      customSearchString += ' 1 = ?';
    }
    
    let fleetList = await FleetInfoModel.filterFleets(customSearchString, searchParams);
  
    res.send(fleetList);    
  }


  getFleetVehicles = async (req, res, next) => {
    let searchParams = [];
    let customSearchString=``;
    if(!req.query.fleet_id) {
      res.send([]);
    } else {
      if(req.session.userRole !== 5) {
        let fleetVehicleCount = await VehicleModel.countFleetVehicles(req.query.fleet_id, req.query.searchString, req.query.vehicleTypeFilter);
        let fleetVehicleList = await VehicleModel.getFleetVehicles(req.query.fleet_id, req.query.page, req.query.limit, req.query.searchString, req.query.vehicleTypeFilter);        
        res.send({fleetVehicleCount, fleetVehicleList}); 
      } else {
        let fleetVehicleCount = await VehicleModel.countFleetHotelVehicles(req.query.fleet_id, req.query.searchString, req.query.vehicleTypeFilter);
        let fleetVehicleList = await VehicleModel.getFleetHotelVehicles(req.query.fleet_id, req.query.page, req.query.limit, req.query.searchString, req.query.vehicleTypeFilter);
        res.send({fleetVehicleCount, fleetVehicleList});   
      }
    }
  }


  fleetVehiclesToExcel = async (req, res, next) => {
    let fleetVehicles = [];
    let queryCount = Math.ceil(parseInt(req.query.totalFleetVehicles) / 5000);    
   
    for (let i = 0; i < queryCount; i++) {
      let fleetVList;
      if(req.session.userRole !== 5) {             
        fleetVList = await VehicleModel.getFleetVehicles(req.query.fleet_id, i, 5000, req.query.searchString, req.query.vehicleTypeFilter);
      } else if(req.session.userRole === 5) {              
        fleetVList = await VehicleModel.getFleetHotelVehicles(req.query.fleet_id, i, 5000, req.query.searchString, req.query.vehicleTypeFilter);
      }  
      
      if(fleetVList.length){
        fleetVList.forEach((f) => {          
          fleetVehicles.push({
            nrinmatriculare: f.reg_number,
            km: f.vehicle_milage,
            tipauto: f.vehicle_type
          });
        });
      }
    }    
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Portofoliu vehicule flota");

    worksheet.columns = [
      { header: "Nr. Inmatriculare", key: "nrinmatriculare", width: 30 },
      { header: "KM", key: "km", width: 25 },
      { header: "Tip auto", key: "tipauto", width: 25 }
    ];
    worksheet.addRows(fleetVehicles);
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {      
      cell.font = {
        bold: true,
      };
    })
    //Commit the changed row to the stream
    headerRow.commit();   
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "Portofoliu vehicule flota.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  }



  getFleetFiltersValues = async (req, res, next) => {
    let fleetsRegions = await FleetInfoModel.getDistinctFleetsRegions();
    let fleetsHealthScores = await FleetInfoModel.getDistinctFleetsHealthScores();  
    let fleetsFiltersValues = [{fleetsRegions: fleetsRegions, fleetsHealthScores: fleetsHealthScores}];
    res.send(fleetsFiltersValues);      
  }

  updateFleet = async (req, res, next) => {
    this.checkValidation(req);

    let hasAccess = await FleetInfoModel.checkFleetWriteAccess(req.params.id, req.session.userId, req.session.userRole);  
    if(!hasAccess) {
      throw new HttpException(401, 'Acces interzis');  
    }
    
    await this.hashPassword(req);

    let { confirm_password, ...restOfUpdates } = req.body;

    let result ;
    if(req.session.userRole === 1) {
      result = await FleetInfoModel.updateFleet(restOfUpdates, req.params.id);
    } else {  
      result  = await FleetInfoModel.agentUpdateFleet(restOfUpdates, req.params.id);
    }

    if(!result) {
      throw new HttpException(500, 'Something went wrong');
    }

    const { affectedRows, changedRows, info } = result;

    const message = !affectedRows ? 'Flota nu a fost gasita' : 
      affectedRows ? 'Flota actualizata' : 'Actualizare esuata';

    res.send({message, info});
  }

  selfUpdate = async (req, res, next) => { 
    this.checkValidation(req);
    
    await this.hashPassword(req);

    const{ confirm_password, ...restOfUpdates } = req.body;
  
    const result = await FleetInfoModel.updateFleetByUId(restOfUpdates, req.session.userId);

    if(!result) {
      throw new HttpException(500, 'Server error');
    }

    const { affectedRows, changedRows, info } = result;

    const message = !affectedRows ? 'Actualizare esuata' : 'Date actualizate';
   
    const user = await UserModel.findOne({ u_id: req.session.userId});
    
    const { password, ...usr } = user;

    req.session.currentUser = user;
    
    res.send({message, info, usr});
  }

  deleteFleetInfo = async (req, res, next) => {    
    let result;
    if(req.session.userRole === 1) {
      result = await FleetInfoModel.delete(req.params.id);
    } else if(req.session.userRole === 2) {
      result = await FleetInfoModel.agentDelete(req.params.id, req.session.userId);
    }

    if(!result) {
      throw new HttpException(404, 'Flota nu a fost gasita');
    }
    res.send('Flota deleted');
  }
  
  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

  hashPassword = async (req) => {
    if(req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }
  }

}


module.exports = new FleetInfoController;