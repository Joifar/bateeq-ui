import { inject, bindable, computedFrom } from "aurelia-framework";
import { Service } from "../service";
import moment from "moment";
import _ from "lodash";
const searchCCByRO = require("../../../../loader/search-by-ro-merchandiser");
const searchUnit = require("../../../../loader/unit-loader");
const searchYear = require("../../../../loader/weekly-plan-loader");
const searchWeek = require("../../../../loader/weekly-plan-item-loader");
const defaultNumberFormat = "0,0.00";

@inject(Service)
export class WorkSchedule {
  controlOptions = {
    control: {
      length: 12
    }
  };

  get costCalculationLoader() {
    return searchCCByRO;
  }

  get unitLoader() {
    return searchUnit;
  }

  get yearLoader() {
    return searchYear;
  }

  get weekLoader() {
    return searchWeek;
  }

  @computedFrom("includedUnitCode")
  get filterYear() {
    return { UnitCode: this.includedUnitCode };
  }

  @computedFrom("includedWeeklyPlanId")
  get filterWeek() {
    return { WeeklyPlanId: this.includedWeeklyPlanId };
  }

  weekView = week => {
    let weekText = "";
    if (week) {
      if (week.WeekText) {
        return week.WeekText;
      }
      const startDate = moment(week.StartDate).format("DD MMM YYYY");
      const endDate = moment(week.EndDate).format("DD MMM YYYY");
      weekText = `W${week.WeekNumber} - ${startDate} s/d ${endDate}`;
    }
    week.WeekText = weekText;
    return week.WeekText;
  };

  constructor(service) {
    this.service = service;
  }

  activate(context) {
    this.context = context;
    this.data = context.data;
    this.error = context.error;
    this.options = context.options;
    this.readOnly = this.options.readOnly;
    if (!_.isEmpty(this.data)) {
      this.selectedRO = {
        RO: this.data.RO,
        Article: this.data.Article,
        Style: this.data.Style,
        Counter: this.data.Counter,
        SMV_Sewing: this.data.SMV_Sewing
      };
      this.data.Week.RemainingEh = this.data.RemainingEh;
      this.data.Week.Efficiency = this.data.Efficiency;
    }
  }

  @bindable selectedRO;
  selectedROChanged(newValue) {
    this.data.RO = newValue && newValue.RO ? newValue.RO : "";
    this.data.Article = newValue && newValue.Article ? newValue.Article : "";
    this.data.Style = newValue && newValue.Style ? newValue.Style : "";
    this.data.Counter = newValue && newValue.Counter ? newValue.Counter : "";
    this.data.SMV_Sewing =
      newValue && newValue.SMV_Sewing ? newValue.SMV_Sewing : 0;
  }

  @computedFrom("data.Unit")
  get unitExist() {
    if (this.data.Unit) {
      this.includedUnitCode = this.data.Unit.code ? this.data.Unit.code : null;
    } else {
      this.data.Year = null;
    }
    return Boolean(this.data.Unit);
  }

  @computedFrom("data.Year")
  get yearExist() {
    if (this.data.Year) {
      this.includedWeeklyPlanId = this.data.Year.Id ? this.data.Year.Id : null;
    } else {
      this.data.Week = null;
    }
    return Boolean(this.data.Year);
  }

  @computedFrom("data.Week")
  get remainingEH() {
    this.data.RemainingEh =
      this.data.Week && this.data.Week.RemainingEh
        ? this.data.Week.RemainingEh
        : 0;
    return this.data.RemainingEh;
  }

  @computedFrom("data.Week")
  get efficiency() {
    this.data.Efficiency =
      this.data.Week && this.data.Week.Efficiency
        ? this.data.Week.Efficiency
        : 0;
    return this.data.Efficiency;
  }

  @computedFrom("data.SMV_Sewing", "data.TotalOrder")
  get EH_Booking() {
    let EH_BookingValue = 0;
    if (this.data.SMV_Sewing && this.data.TotalOrder) {
      EH_BookingValue = (this.data.SMV_Sewing * this.data.TotalOrder) / 60;
    }
    this.data.EH_Booking = Number(EH_BookingValue.toFixed(2));
    return this.data.EH_Booking;
  }

  @computedFrom("data.RemainingEh", "data.EH_Booking")
  get EH_Remaining() {
    let EH_RemainingValue = 0;
    if (this.data.RemainingEh && this.data.EH_Booking) {
      EH_RemainingValue = this.data.RemainingEh - this.data.EH_Booking;
    }
    this.data.EH_Remaining = Number(EH_RemainingValue.toFixed(2));
    return this.data.EH_Remaining;
  }
}
