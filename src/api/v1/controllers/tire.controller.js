const query = require('../db/db-connection');
const DBTireModel = require('../models/tire.model');
const TireModel = new DBTireModel(query);
const HttpException = require('../utils/HttpException.utils');
const { validationResult } = require('express-validator');
const Role = require('../utils/userRoles.utils');
const excel = require("exceljs");
const dotenv = require('dotenv');
dotenv.config();


class TireController {

  getAllTires = async (req, res, next) => {
    let tiresList = await TireModel.find();
      if(!fleetList.length) {
        throw new HttpException(404, 'Nici o anvelopa gasita');
      }
    res.send(fleetList);
  }

  getTireById = async (req, res, next) => {
    const tire = await TireModel.find({t_id: req.params.id});

    if(!tire || !tire.length) {
      throw new HttpException(401, 'Acces interzis');
    }
    res.send(tire);
  }

  getVehicleTires = async (req, res, next) => {
    if(!req.query.v_id) {
      throw new HttpException(401, 'Acces interzis');    
    }
    const vehicleTires = await TireModel.getVehicleTires(req.query.v_id);
    if(!vehicleTires) {
      throw new HttpException(404, 'Nici o anvelopa gasita');  
    }
    res.send(vehicleTires);
  }

  getVehiclesTiresInfo = async (req, res, next) => {
    if(!req.query.vId) {
      throw new HttpException(401, 'Acces interzis');    
    }
    const vehicleTires = await TireModel.find({vehicle_id: req.query.vId});
    if(!vehicleTires) {
      throw new HttpException(404, 'Nici o anvelopa gasita');  
    }
    res.send(vehicleTires);
  }

  getFleetTiresFilters = async (req, res, next) => {
    if(!req.query.fleet_id) {
      throw new HttpException(404, 'Nici o anvelopa gasita');
    }
    let fleetTiresFilters = await TireModel.getFleetTiresFilters(req.query.fleet_id);
    res.send(fleetTiresFilters); 
  }

  getFleetTires = async (req, res, next) => {
    if(!req.query.fleet_id) {
      throw new HttpException(404, 'Nici o anvelopa gasita');
    }
    let fleetTiresList;
    let tireCount;
    if(req.session.userRole < 3) {
      tireCount = await TireModel.countFleetTiresByFleetId(req.query.fleet_id, req.query.vehicleTypeFilter, req.query.tiresWidthFilter, req.query.tiresHeightFilter, req.query.tiresDiameterFilter, req.query.tiresBrandFilter, req.query.tiresDotFilter, req.query.tiresSeasonFilter, req.query.tiresTreadUsageFilter, req.query.tiresTreadUsageMmFilter);
      fleetTiresList = await TireModel.getFleetTiresByFleetId(req.query.fleet_id, req.session.userId, req.session.userRole, req.query.page, req.query.limit, req.query.vehicleTypeFilter, req.query.tiresWidthFilter, req.query.tiresHeightFilter, req.query.tiresDiameterFilter, req.query.tiresBrandFilter, req.query.tiresDotFilter, req.query.tiresSeasonFilter, req.query.tiresTreadUsageFilter, req.query.tiresTreadUsageMmFilter);
    } else if(req.session.userRole === 3) {
      tireCount = await TireModel.countFleetTiresByFleetId(req.query.fleet_id, req.query.vehicleTypeFilter, req.query.tiresWidthFilter, req.query.tiresHeightFilter, req.query.tiresDiameterFilter, req.query.tiresBrandFilter, req.query.tiresDotFilter, req.query.tiresSeasonFilter, req.query.tiresTreadUsageFilter, req.query.tiresTreadUsageMmFilter);
      fleetTiresList = await TireModel.getOwnFleetTires(req.query.fleet_id, req.session.userId, req.query.page, req.query.limit, req.query.vehicleTypeFilter, req.query.tiresWidthFilter, req.query.tiresHeightFilter, req.query.tiresDiameterFilter, req.query.tiresBrandFilter, req.query.tiresDotFilter, req.query.tiresSeasonFilter, req.query.tiresTreadUsageFilter, req.query.tiresTreadUsageMmFilter);
    }
    res.send({tireCount, fleetTiresList}); 
  }

  tiresToExcel = async (req, res, next) => {
    let tires = [];
    let queryCount = Math.ceil(parseInt(req.query.totalTires) / 5000);    
    for (let i = 0; i < queryCount; i++) { 
      let fleetTiresList;
      if(req.session.userRole < 3) {        
        fleetTiresList = await TireModel.getFleetTiresByFleetId(req.query.fleet_id, req.session.userId, req.session.userRole, i, 5000, req.query.vehicleTypeFilter, req.query.tiresWidthFilter, req.query.tiresHeightFilter, req.query.tiresDiameterFilter, req.query.tiresBrandFilter, req.query.tiresDotFilter, req.query.tiresSeasonFilter, req.query.tiresTreadUsageFilter, req.query.tiresTreadUsageMmFilter);
      } else if(req.session.userRole === 3) {        
        fleetTiresList = await TireModel.getOwnFleetTires(req.query.fleet_id, req.session.userId, i, 5000, req.query.vehicleTypeFilter, req.query.tiresWidthFilter, req.query.tiresHeightFilter, req.query.tiresDiameterFilter, req.query.tiresBrandFilter, req.query.tiresDotFilter, req.query.tiresSeasonFilter, req.query.tiresTreadUsageFilter, req.query.tiresTreadUsageMmFilter);
      }
      if(fleetTiresList.length) {
        fleetTiresList.forEach((f) => {         
          tires.push({
            latime: f.width,
            inaltime: f.height,
            diametru: f.diameter,
            indviteza: f.speed_index,
            indsarcina: f.load_index,
            sezon: f.tire_season,
            brand: f.brand,
            tipauto: f.vehicle_type,
            uzura: f.tread_wear,
            uzuramm: f.tire_tread_wear,
            dot: f.tire_dot
          });
        });
      }
    }
    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Portofoliu anvelope");

    worksheet.columns = [
      { header: "Latime", key: "latime", width: 30 },
      { header: "Inaltime", key: "inaltime", width: 30 },
      { header: "Diametru", key: "diametru", width: 30 },
      { header: "Ind. viteza", key: "indviteza", width: 30 },
      { header: "Ind. sarcina", key: "indsarcina", width: 30 },      
      { header: "Sezon", key: "sezon", width: 30 },
      { header: "Brand", key: "brand", width: 30 },
      { header: "Tip auto", key: "tipauto", width: 30 },
      { header: "Uzura", key: "uzura", width: 30 },
      { header: "Uzura (mm)", key: "uzuramm", width: 30 },
      { header: "DOT", key: "dot", width: 30 },
    ];
    worksheet.addRows(tires);
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
      "attachment; filename=" + "Portofoliu anvelope.xlsx"
    );

    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  }

  deleteTire = async (req, res, next) => {
    const result = await TireModel.delete(req.params.id);
    if(!result) {
      throw new HttpException(404, 'Anvelopa nu a fost gasita');
    }
    res.send('Anvelopa deleted');
  }
  
  checkValidation = (req) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      throw new HttpException(400, 'Validation failed', errors);
    }
  }

}


module.exports = new TireController;