const Employee = require("../models/employee");

const employeeResolver = {
  Query: {
    getAllEmployees: async () => {
      return await Employee.find();
    },
    searchEmployeeById: async (_, { eid }) => {
      return await Employee.findById(eid);
    },
  },
  Mutation: {
    addNewEmployee: async (_, { input }) => {
      const employee = new Employee(input);
      await employee.save();
      return employee;
    },
    updateEmployeeById: async (_, { eid, input }) => {
      return await Employee.findByIdAndUpdate(eid, input, {
        new: true,
      });
    },
    deleteEmployeeById: async (_, { eid }) => {
      return await Employee.findByIdAndDelete(eid);
    },
  },
};

module.exports = employeeResolver;
