import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import UserForm from "../components/UserForm";
import apiService from "../services/api";

const UserFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [metadata, setMetadata] = useState({ roles: [], positions: [] });
  const [loading, setLoading] = useState(true);

  const editingUser = location.state?.editingUser || null;

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const response = await apiService.getMetadata();
      if (response.success) {
        setMetadata(response.data);
      }
    } catch (error) {
      console.error("Error fetching metadata:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    navigate("/");
  };

  const handleCancel = () => {
    navigate("/");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <UserForm
        editingUser={editingUser}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        metadata={metadata}
      />
    </div>
  );
};

export default UserFormPage;
