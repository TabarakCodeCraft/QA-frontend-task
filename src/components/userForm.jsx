import React, { useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Row,
  Col,
  Space,
  message,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CrownOutlined,
  CalendarOutlined,
  PhoneOutlined,
  HomeOutlined,
  BankOutlined,
  DollarOutlined,
  ContactsOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiService from '../services/api';

const { Option } = Select;
const { TextArea } = Input;

const UserForm = ({ 
  editingUser, 
  onSuccess, 
  onCancel, 
  metadata = { roles: [], positions: [] } 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (editingUser) {
      form.setFieldsValue({
        ...editingUser,
        hireDate: editingUser.hireDate ? dayjs(editingUser.hireDate) : null,
      });
    } else {
      form.resetFields();
    }
  }, [editingUser, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const formData = {
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        age: values.age,
        position: values.position,
        department: values.department,
        workplace: values.workplace,
        salary: values.salary,
        phoneNumber: values.phoneNumber,
        address: values.address,
        hireDate: values.hireDate ? values.hireDate.format("YYYY-MM-DD") : null,
        emergencyContact: values.emergencyContact,
        skills: values.skills
          ? values.skills.split(",").map((s) => s.trim()).filter((s) => s.length > 0)
          : [],
      };

      let response;
      if (editingUser) {
        response = await apiService.updateUser(editingUser.id, formData);
      } else {
        response = await apiService.createUser(formData);
      }

      if (response.success) {
        message.success(
          `User ${editingUser ? "updated" : "created"} successfully`
        );
        onSuccess();
      } else {
        let errorMessage = response.message || `Failed to ${editingUser ? "update" : "create"} user`;
        
        if (response.data && response.data.details) {
          const validationErrors = response.data.details.map(detail => detail.msg).join(', ');
          errorMessage = `Validation errors: ${validationErrors}`;
        }
        
        message.error(errorMessage);
        console.error("API Error:", response);
      }
    } catch (error) {
      message.error(`Network error: ${error.message}`);
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
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

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-100 via-white to-cyan-100 flex items-center justify-center p-6 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Form Card */}
      <div className="relative w-full max-w-5xl h-full max-h-[95vh] flex flex-col">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="text-center space-y-3 flex-shrink-0 mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md">
              {editingUser ? (
                <UserOutlined className="text-3xl text-white" />
              ) : (
                <PlusOutlined className="text-3xl text-white" />
              )}
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h1>
            <p className="text-gray-600 text-base">
              {editingUser ? 'Update user information' : 'Add a new user to the system'}
            </p>
          </div>

          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              size="large"
              className="space-y-8"
            >
              {/* Basic Information */}
              <div className="bg-gray-50/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 text-gray-800 font-semibold text-lg">
                  <UserOutlined className="text-indigo-500 text-xl" />
                  <span>Basic Information</span>
                </div>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[
                        { required: true, message: 'Please enter full name' },
                        { min: 2, message: 'Name must be at least 2 characters' }
                      ]}
                    >
                      <Input 
                        prefix={<UserOutlined className="text-gray-400" />} 
                        placeholder="Enter full name"
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Please enter valid email' }
                      ]}
                    >
                      <Input 
                        prefix={<MailOutlined className="text-gray-400" />} 
                        placeholder="Enter email address"
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="password"
                      label="Password"
                      rules={[
                        { required: !editingUser, message: 'Please enter password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined className="text-gray-400" />} 
                        placeholder="Enter password"
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="role"
                      label="Role"
                      rules={[{ required: true, message: 'Please select role' }]}
                    >
                      <Select 
                        placeholder="Select role"
                        className="rounded-xl"
                        suffixIcon={<CrownOutlined className="text-gray-400" />}
                      >
                        {metadata.roles?.map((role) => (
                          <Option key={role} value={role}>
                            <span style={{ 
                              color: getRoleColor(role),
                              fontWeight: 'bold'
                            }}>
                              {role.toUpperCase()}
                            </span>
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Professional Information */}
              <div className="bg-gray-50/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 text-gray-800 font-semibold text-lg">
                  <BankOutlined className="text-green-600 text-xl" />
                  <span>Professional Information</span>
                </div>
                
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name="age"
                      label="Age"
                      rules={[
                        {
                          type: "number",
                          min: 18,
                          max: 100,
                          message: "Age must be between 18-100",
                        },
                      ]}
                    >
                      <InputNumber 
                        placeholder="Age" 
                        className="w-full rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                        min={18}
                        max={100}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="position" label="Position">
                      <Select 
                        placeholder="Select position" 
                        allowClear
                        className="rounded-xl"
                      >
                        {metadata.positions?.map((position) => (
                          <Option key={position} value={position}>
                            {position}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="department" label="Department">
                      <Input 
                        prefix={<BankOutlined className="text-gray-400" />} 
                        placeholder="Department"
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="workplace" label="Workplace">
                      <Input
                        prefix={<BankOutlined className="text-gray-400" />}
                        placeholder="Company/Organization"
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="salary" label="Salary">
                      <InputNumber
                        prefix={<DollarOutlined className="text-gray-400" />}
                        placeholder="Salary"
                        className="w-full rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                        formatter={(value) =>
                          `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        min={0}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 text-gray-800 font-semibold text-lg">
                  <PhoneOutlined className="text-orange-600 text-xl" />
                  <span>Contact Information</span>
                </div>
                
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="phoneNumber" 
                      label="Phone Number"
                      rules={[
                        {
                          pattern: /^[\d\s\-\(\)\+]+$/,
                          message: 'Invalid phone number format (e.g., +1234567890 or 123-456-7890)',
                        },
                      ]}
                    >
                      <Input 
                        prefix={<PhoneOutlined className="text-gray-400" />} 
                        placeholder="+1234567890 or 123-456-7890"
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="hireDate" label="Hire Date">
                      <DatePicker 
                        className="w-full rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                        placeholder="Select hire date"
                        suffixIcon={<CalendarOutlined className="text-gray-400" />}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="address" label="Address">
                  <TextArea
                    prefix={<HomeOutlined className="text-gray-400" />}
                    placeholder="Full address"
                    rows={3}
                    className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                </Form.Item>
              </div>

              {/* Emergency Contact */}
              <div className="bg-gray-50/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 text-gray-800 font-semibold text-lg">
                  <ContactsOutlined className="text-red-600 text-xl" />
                  <span>Emergency Contact</span>
                </div>
                
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={["emergencyContact", "name"]}
                      label="Contact Name"
                    >
                      <Input
                        prefix={<ContactsOutlined className="text-gray-400" />}
                        placeholder="Emergency contact name"
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={["emergencyContact", "phone"]}
                      label="Contact Phone"
                      rules={[
                        {
                          pattern: /^[\d\s\-\(\)\+]+$/,
                          message: 'Invalid phone number format (e.g., +1234567890 or 123-456-7890)',
                        },
                      ]}
                    >
                      <Input
                        prefix={<PhoneOutlined className="text-gray-400" />}
                        placeholder="+1234567890 or 123-456-7890"
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item
                      name={["emergencyContact", "relationship"]}
                      label="Relationship"
                    >
                      <Input 
                        placeholder="Relationship" 
                        className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              {/* Skills */}
              <div className="bg-gray-50/50 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 text-gray-800 font-semibold text-lg">
                  <span className="text-2xl">💼</span>
                  <span>Skills & Expertise</span>
                </div>
                
                <Form.Item name="skills" label="Skills (comma-separated)">
                  <TextArea 
                    placeholder="JavaScript, React, Node.js, Python, SQL..." 
                    rows={3}
                    className="rounded-xl border-gray-200/50 focus:border-indigo-500 focus:ring-indigo-500/20"
                  />
                </Form.Item>
              </div>

              {/* Action Buttons */}
              <div className="text-center pt-8 border-t border-gray-200/50">
                <Space size="large">
                  <Button
                    size="large"
                    icon={<ArrowLeftOutlined />}
                    onClick={onCancel}
                    className="rounded-xl h-12 px-8 border-gray-200/50 hover:border-indigo-500 text-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    className="rounded-xl h-12 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 border-0 hover:from-indigo-600 hover:to-purple-700"
                  >
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
