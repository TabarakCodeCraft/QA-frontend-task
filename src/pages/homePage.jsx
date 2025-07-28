import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Statistic,
  Row,
  Col,
  message,
  Popconfirm,
  Avatar,
  Tooltip,
  Drawer,
  Descriptions,
  Badge,
  Typography,
  Input,
  Spin,
  Divider,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LogoutOutlined,
  SearchOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  BankOutlined,
  ContactsOutlined,
  ArrowRightOutlined,
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
      title: "Avatar",
      dataIndex: "name",
      key: "avatar",
      width: 60,
      render: (name) => (
        <Avatar
          size="large"
          icon={<UserOutlined />}
          style={{ backgroundColor: "#1890ff" }}
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
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Space>
          <MailOutlined style={{ color: "#1890ff" }} />
          <Text copyable>{email}</Text>
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
        <Tag color={getRoleColor(role)}>{role?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      render: (position) => <Text>{position}</Text>,
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (department) => <Text>{department}</Text>,
    },
    {
      title: "Salary",
      dataIndex: "salary",
      key: "salary",
      render: (salary) =>
        salary ? (
          <Space>
            <DollarOutlined style={{ color: "#52c41a" }} />
            <Text>{salary.toLocaleString()}</Text>
          </Space>
        ) : (
          "-"
        ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive) => (
        <Badge
          status={isActive ? "success" : "error"}
          text={isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="primary"
              ghost
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewUser(record)}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              type="default"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
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
                    backgroundColor: "#ff4d4f",
                    borderColor: "#ff4d4f",
                    color: "white",
                  },
                }}
                cancelButtonProps={{
                  style: {
                    borderColor: "#d9d9d9",
                    color: "#595959",
                  },
                }}
                placement="topRight"
              >
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-gray-100 to-slate-100 rounded-full mix-blend-multiply filter blur-xl opacity-30"></div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <TeamOutlined style={{ fontSize: "24px", color: "#1890ff" }} />
              <Title level={2} style={{ margin: 0 }}>
                User Management System
              </Title>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text>Welcome, {currentUser?.name}</Text>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={onLogout}
                style={{ borderRadius: "8px" }}
              >
                Logout
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {Object.keys(stats).length > 0 && (
        <Row gutter={16} className="mb-8">
          <Col xs={24} sm={12} md={6}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
              <Statistic
                title="Total Users"
                value={stats.totalUsers || 0}
                prefix={<TeamOutlined style={{ color: "#1890ff" }} />}
                valueStyle={{ color: "#1890ff" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
              <Statistic
                title="Average Age"
                value={stats.averageAge || 0}
                suffix="years"
                prefix={<UserOutlined style={{ color: "#52c41a" }} />}
                valueStyle={{ color: "#52c41a" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
              <Statistic
                title="Average Salary"
                value={stats.averageSalary || 0}
                prefix={<DollarOutlined style={{ color: "#fa8c16" }} />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </div>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center">
              <Statistic
                title="Departments"
                value={stats.departments || 0}
                prefix={<BankOutlined style={{ color: "#722ed1" }} />}
                valueStyle={{ color: "#722ed1" }}
              />
            </div>
          </Col>
        </Row>
      )}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Users List
            </Title>
          </Col>
          <Col>
            <Space>
              <Search
                placeholder="Search users..."
                onSearch={handleSearch}
                style={{ width: 300 }}
                allowClear
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddUser}
                className="rounded-lg bg-blue-600 border-0 hover:bg-blue-700"
              >
                Add User
              </Button>
            </Space>
          </Col>
        </Row>

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
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </div>

      <Drawer
        title="User Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={600}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff" }}
              >
                {selectedUser.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Title level={3} style={{ marginTop: 16, marginBottom: 8 }}>
                {selectedUser.name}
              </Title>
              <Tag
                color={getRoleColor(selectedUser.role)}
                style={{ fontSize: "14px", padding: "4px 12px" }}
              >
                {selectedUser.role?.toUpperCase()}
              </Tag>
            </div>

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined />
                  <Text copyable>{selectedUser.email}</Text>
                </Space>
              </Descriptions.Item>
              {selectedUser.age && (
                <Descriptions.Item label="Age">
                  {selectedUser.age} years
                </Descriptions.Item>
              )}
              {selectedUser.position && (
                <Descriptions.Item label="Position">
                  {selectedUser.position}
                </Descriptions.Item>
              )}
              {selectedUser.department && (
                <Descriptions.Item label="Department">
                  {selectedUser.department}
                </Descriptions.Item>
              )}
              {selectedUser.salary && (
                <Descriptions.Item label="Salary">
                  <Space>
                    <DollarOutlined />
                    <Text>{selectedUser.salary.toLocaleString()}</Text>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedUser.phoneNumber && (
                <Descriptions.Item label="Phone">
                  <Space>
                    <PhoneOutlined />
                    <Text>{selectedUser.phoneNumber}</Text>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedUser.address && (
                <Descriptions.Item label="Address">
                  <Space>
                    <HomeOutlined />
                    <Text>{selectedUser.address}</Text>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedUser.hireDate && (
                <Descriptions.Item label="Hire Date">
                  <Space>
                    <CalendarOutlined />
                    <Text>{selectedUser.hireDate}</Text>
                  </Space>
                </Descriptions.Item>
              )}
              {selectedUser.skills && selectedUser.skills.length > 0 && (
                <Descriptions.Item label="Skills">
                  <Space wrap>
                    {selectedUser.skills.map((skill, index) => (
                      <Tag key={index} color="blue">
                        {skill}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedUser.emergencyContact && (
              <>
                <Divider orientation="left">Emergency Contact</Divider>
                <Descriptions bordered column={1}>
                  {selectedUser.emergencyContact.name && (
                    <Descriptions.Item label="Name">
                      <Space>
                        <ContactsOutlined />
                        <Text>{selectedUser.emergencyContact.name}</Text>
                      </Space>
                    </Descriptions.Item>
                  )}
                  {selectedUser.emergencyContact.phone && (
                    <Descriptions.Item label="Phone">
                      <Space>
                        <PhoneOutlined />
                        <Text>{selectedUser.emergencyContact.phone}</Text>
                      </Space>
                    </Descriptions.Item>
                  )}
                  {selectedUser.emergencyContact.relationship && (
                    <Descriptions.Item label="Relationship">
                      <Text>{selectedUser.emergencyContact.relationship}</Text>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default HomePage;
