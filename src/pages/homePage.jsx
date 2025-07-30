import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  message,
  Popconfirm,
  Avatar,
  Tooltip,
  Drawer,
  Descriptions,
  Badge,
  Typography,
  Input,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LogoutOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  BankOutlined,
  ContactsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api.js";

const { Text, Title } = Typography;
const { Search } = Input;

const HomePage = ({ onLogout, token, currentUser }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    role: null,
    department: null,
    search: "",
  });

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiService.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async (page = 1, pageSize = 10, searchFilters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: page.toString(),
        limit: pageSize.toString(),
      };

      if (searchFilters.role && searchFilters.role !== "null") {
        params.role = searchFilters.role;
      }
      if (searchFilters.department && searchFilters.department !== "null") {
        params.department = searchFilters.department;
      }
      if (searchFilters.search && searchFilters.search.trim()) {
        params.search = searchFilters.search.trim();
      }

      const response = await apiService.getUsers(params);

      if (response.success) {
        setUsers(response.data.users || []);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.limit,
          total: response.data.pagination.total,
        });
      } else {
        throw new Error("Failed to fetch users");
      }
    } catch (error) {
      if (error.message.includes("401") || error.message.includes("TOKEN")) {
        message.error("Session expired. Please login again.");
        onLogout();
        return;
      }
      message.error("Failed to fetch users");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pag, tableFilters) => {
    const newFilters = {
      role: tableFilters.role?.[0] || "",
      department: tableFilters.department?.[0] || "",
      search: filters.search,
    };
    setFilters(newFilters);
    fetchUsers(pag.current, pag.pageSize, newFilters);
  };

  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchUsers(1, pagination.pageSize, newFilters);
  };

  const handleAddUser = () => {
    navigate("/user/create");
  };

  const handleEditUser = (user) => {
    navigate("/user/edit", { state: { editingUser: user } });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDrawerVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await apiService.deleteUser(userId);

      if (response.success) {
        message.success("User deleted successfully");
        fetchUsers(pagination.current, pagination.pageSize, filters);
        fetchStats();
      } else {
        message.error(response.message || "Failed to delete user");
      }
    } catch (error) {
      message.error("Failed to delete user");
      console.error("Error deleting user:", error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "red",
      manager: "purple",
      supervisor: "orange",
      user: "blue",
      employee: "green",
    };
    return colors[role] || "default";
  };

  const columns = [
    {
      title: "",
      dataIndex: "name",
      key: "avatar",
      width: 60,
      responsive: ["md"],
      render: (name) => (
        <Avatar
          size="large"
          icon={<UserOutlined />}
          style={{
            backgroundColor: "#3b82f6",
            border: "2px solid #e5e7eb",
          }}
        >
          {name?.charAt(0)?.toUpperCase()}
        </Avatar>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (name, record) => (
        <div className="flex items-center space-x-3">
          <Avatar
            size="default"
            icon={<UserOutlined />}
            className="md:hidden"
            style={{
              backgroundColor: "#3b82f6",
              border: "1px solid #e5e7eb",
            }}
          >
            {name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <Text strong className="text-gray-900">
              {name}
            </Text>
            <div className="md:hidden text-xs text-gray-500 mt-1">
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      responsive: ["md"],
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: "#3b82f6" }} />
          <Text copyable className="text-gray-700">
            {email}
          </Text>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Manager", value: "manager" },
        { text: "User", value: "user" },
        { text: "Employee", value: "employee" },
      ],
      render: (role) => (
        <Tag
          color={getRoleColor(role)}
          className="font-medium px-2 py-1 rounded-md"
        >
          {role?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      responsive: ["lg"],
      render: (position) => <Text className="text-gray-700">{position}</Text>,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      responsive: ["lg"],
      render: (department) => (
        <Text className="text-gray-700">{department}</Text>
      ),
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      responsive: ["xl"],
      render: (salary) =>
        salary ? (
          <Space>
            <DollarOutlined style={{ color: "#10b981" }} />
            <Text className="font-medium text-gray-900">
              {salary.toLocaleString()}
            </Text>
          </Space>
        ) : (
          <Text className="text-gray-400">-</Text>
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      responsive: ["sm"],
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "error"}
          text={
            <span className={isActive ? "text-green-600" : "text-red-600"}>
              {isActive ? "Active" : "Inactive"}
            </span>
          }
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewUser(record)}
              className="hover:bg-blue-50 hover:text-blue-600 rounded-md"
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
              className="hover:bg-gray-50 hover:text-gray-700 rounded-md"
            />
          </Tooltip>
          {currentUser?.role === "admin" && (
            <Tooltip title="Delete User">
              <Popconfirm
                title="Are you sure you want to delete this user?"
                onConfirm={() => handleDeleteUser(record.id)}
                okText="Yes"
                cancelText="No"
                okType="danger"
                okButtonProps={{
                  style: {
                    backgroundColor: "#ef4444",
                    borderColor: "#ef4444",
                    color: "white",
                  },
                }}
                cancelButtonProps={{
                  style: {
                    borderColor: "#d1d5db",
                    color: "#6b7280",
                  },
                }}
                placement="topRight"
              >
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  className="hover:bg-red-50 hover:text-red-600 rounded-md"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-16 translate-x-16"></div>

        <div className="relative bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/30 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl border border-white/30 p-4 sm:p-8 mb-6 sm:mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full -translate-y-8 sm:-translate-y-16 translate-x-8 sm:translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-16 sm:w-24 h-16 sm:h-24 bg-gradient-to-tr from-violet-400/10 to-purple-400/10 rounded-full translate-y-8 sm:translate-y-12 -translate-x-8 sm:-translate-x-12"></div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl blur-lg opacity-30"></div>
                <div className="relative p-3 sm:p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl shadow-xl">
                  <TeamOutlined className="text-white text-xl sm:text-2xl" />
                </div>
              </div>
              <div>
                <Title
                  level={3}
                  className="!mb-1 !text-gray-900 !font-bold text-lg sm:text-2xl"
                >
                  User Management System
                </Title>
                <Text className="text-gray-600 text-sm sm:text-base font-medium">
                  Manage your team efficiently
                </Text>
              </div>
            </div>
            <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-left sm:text-right">
                <Text className="text-gray-500 text-xs sm:text-sm font-medium block">
                  Welcome back,
                </Text>
                <Text strong className="text-gray-900 text-sm sm:text-lg">
                  {currentUser?.name}
                </Text>
              </div>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={onLogout}
                className="rounded-xl sm:rounded-2xl px-4 sm:px-8 h-10 sm:h-12 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-red-600 border-0 font-medium"
              >
                <span className="hidden sm:inline ml-1">Logout</span>
              </Button>
            </div>
          </div>
        </div>

        {Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-600 text-sm font-medium">
                    Total Users
                  </Text>
                  <div className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.totalUsers || 0}
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <TeamOutlined className="text-blue-600 text-xl" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-600 text-sm font-medium">
                    Average Age
                  </Text>
                  <div className="text-2xl font-bold text-green-600 mt-1">
                    {stats.averageAge || 0}{" "}
                    <span className="text-sm font-normal">years</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <UserOutlined className="text-green-600 text-xl" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-600 text-sm font-medium">
                    Average Salary
                  </Text>
                  <div className="text-2xl font-bold text-orange-600 mt-1">
                    ${(stats.averageSalary || 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <DollarOutlined className="text-orange-600 text-xl" />
                </div>
              </div>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <Text className="text-gray-600 text-sm font-medium">
                    Departments
                  </Text>
                  <div className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.departments || 0}
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BankOutlined className="text-purple-600 text-xl" />
                </div>
              </div>
            </Card>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <Title level={4} className="!mb-1 !text-gray-900">
                  Users List
                </Title>
                <Text className="text-gray-600 text-sm">
                  {pagination.total} total users
                </Text>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Search
                  placeholder="Search users..."
                  onSearch={handleSearch}
                  className="w-full sm:w-80"
                  allowClear
                  size="large"
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddUser}
                  size="large"
                  className="rounded-xl px-6 bg-blue-600 border-0 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                >
                  Add User
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} users`,
                responsive: true,
              }}
              onChange={handleTableChange}
              scroll={{ x: 800 }}
              className="custom-table"
              rowClassName="hover:bg-gray-50/50 transition-colors duration-200"
            />
          </div>
        </div>
      </div>

      <Drawer
        title={
          <div className="text-lg font-semibold text-gray-900">
            User Details
          </div>
        }
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={window.innerWidth < 768 ? "100%" : 600}
        className="user-drawer"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{
                  backgroundColor: "#3b82f6",
                  border: "3px solid white",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                }}
              >
                {selectedUser.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Title level={3} className="!mt-4 !mb-2 !text-gray-900">
                {selectedUser.name}
              </Title>
              <Tag
                color={getRoleColor(selectedUser.role)}
                className="px-3 py-1 text-sm font-medium rounded-lg"
              >
                {selectedUser.role?.toUpperCase()}
              </Tag>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <Descriptions
                bordered
                column={1}
                size="middle"
                className="custom-descriptions"
              >
                <Descriptions.Item
                  label={
                    <span className="font-medium text-gray-700">Email</span>
                  }
                >
                  <Space>
                    <MailOutlined className="text-blue-600" />
                    <Text copyable className="text-gray-900">
                      {selectedUser.email}
                    </Text>
                  </Space>
                </Descriptions.Item>
                {selectedUser.age && (
                  <Descriptions.Item
                    label={
                      <span className="font-medium text-gray-700">Age</span>
                    }
                  >
                    <Text className="text-gray-900">
                      {selectedUser.age} years
                    </Text>
                  </Descriptions.Item>
                )}
                {selectedUser.position && (
                  <Descriptions.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Position
                      </span>
                    }
                  >
                    <Text className="text-gray-900">
                      {selectedUser.position}
                    </Text>
                  </Descriptions.Item>
                )}
                {selectedUser.department && (
                  <Descriptions.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Department
                      </span>
                    }
                  >
                    <Text className="text-gray-900">
                      {selectedUser.department}
                    </Text>
                  </Descriptions.Item>
                )}
                {selectedUser.salary && (
                  <Descriptions.Item
                    label={
                      <span className="font-medium text-gray-700">Salary</span>
                    }
                  >
                    <Space>
                      <DollarOutlined className="text-green-600" />
                      <Text className="text-gray-900 font-medium">
                        ${selectedUser.salary.toLocaleString()}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedUser.phoneNumber && (
                  <Descriptions.Item
                    label={
                      <span className="font-medium text-gray-700">Phone</span>
                    }
                  >
                    <Space>
                      <PhoneOutlined className="text-blue-600" />
                      <Text className="text-gray-900">
                        {selectedUser.phoneNumber}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedUser.address && (
                  <Descriptions.Item
                    label={
                      <span className="font-medium text-gray-700">Address</span>
                    }
                  >
                    <Space align="start">
                      <HomeOutlined className="text-blue-600 mt-1" />
                      <Text className="text-gray-900">
                        {selectedUser.address}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedUser.hireDate && (
                  <Descriptions.Item
                    label={
                      <span className="font-medium text-gray-700">
                        Hire Date
                      </span>
                    }
                  >
                    <Space>
                      <CalendarOutlined className="text-blue-600" />
                      <Text className="text-gray-900">
                        {selectedUser.hireDate}
                      </Text>
                    </Space>
                  </Descriptions.Item>
                )}
                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <Descriptions.Item
                    label={
                      <span className="font-medium text-gray-700">Skills</span>
                    }
                  >
                    <div className="flex flex-wrap gap-2">
                      {selectedUser.skills.map((skill, index) => (
                        <Tag key={index} color="blue" className="rounded-md">
                          {skill}
                        </Tag>
                      ))}
                    </div>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            {selectedUser.emergencyContact && (
              <div className="bg-red-50 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <ContactsOutlined className="text-red-600" />
                  <Title level={5} className="!mb-0 !text-red-800">
                    Emergency Contact
                  </Title>
                </div>
                <Descriptions
                  bordered
                  column={1}
                  size="middle"
                  className="custom-descriptions"
                >
                  {selectedUser.emergencyContact.name && (
                    <Descriptions.Item
                      label={
                        <span className="font-medium text-gray-700">Name</span>
                      }
                    >
                      <Text className="text-gray-900">
                        {selectedUser.emergencyContact.name}
                      </Text>
                    </Descriptions.Item>
                  )}
                  {selectedUser.emergencyContact.phone && (
                    <Descriptions.Item
                      label={
                        <span className="font-medium text-gray-700">Phone</span>
                      }
                    >
                      <Space>
                        <PhoneOutlined className="text-red-600" />
                        <Text className="text-gray-900">
                          {selectedUser.emergencyContact.phone}
                        </Text>
                      </Space>
                    </Descriptions.Item>
                  )}
                  {selectedUser.emergencyContact.relationship && (
                    <Descriptions.Item
                      label={
                        <span className="font-medium text-gray-700">
                          Relationship
                        </span>
                      }
                    >
                      <Text className="text-gray-900">
                        {selectedUser.emergencyContact.relationship}
                      </Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </div>
            )}
          </div>
        )}
      </Drawer>
 
    </div>
  );
};

export default HomePage;
