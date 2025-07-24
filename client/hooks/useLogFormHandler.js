import { useState, useRef, useImperativeHandle, useEffect } from 'react';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import apiClient from '../api/client';
import ErrorHandler from '../utils/errorHandler';

export default function useLogFormHandler(config) {
  const {
    endpoint, // e.g., 'sessions', 'seminars', 'competitions'
    itemName, // e.g., 'session', 'seminar', 'competition'
    validateData, // function to validate data before save
    transformDataForEdit, // function to transform API response for form state
    transformDataForSave, // function to transform form state for API
  } = config;

  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const screenRef = useRef();

  // Common state
  const [itemToEdit, setItemToEdit] = useState(null);
  const [loading, setLoading] = useState(!!params.id);

  const isEditing = !!itemToEdit;

  // Fetch data for editing
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/${endpoint}/${params.id}`);
      const item = response.data;
      
      setItemToEdit(item);
      
      // Allow caller to transform the data for form state
      if (transformDataForEdit) {
        transformDataForEdit(item);
      }
    } catch (error) {
      ErrorHandler.load(itemName, error);
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Generic save/update handler
  const handleSaveOrUpdate = async (formData) => {
    // Validate data if validator provided
    if (validateData) {
      const validationError = validateData(formData);
      if (validationError) {
        ErrorHandler.validation(validationError);
        return;
      }
    }

    // Transform data if transformer provided
    const dataToSave = transformDataForSave ? transformDataForSave(formData) : formData;

    try {
      if (isEditing) {
        await apiClient.put(`/${endpoint}/${itemToEdit._id}`, dataToSave);
      } else {
        await apiClient.post(`/${endpoint}`, dataToSave);
      }
      router.back();
    } catch (error) {
      ErrorHandler.save(itemName, error);
    }
  };

  // Generic delete handler
  const handleDelete = async () => {
    ErrorHandler.confirmDelete(`${itemName} log`, null, async () => {
      try {
        await apiClient.delete(`/${endpoint}/${itemToEdit._id}`);
        router.back();
      } catch (error) {
        ErrorHandler.delete(itemName, error);
      }
    });
  };

  // Setup useImperativeHandle and navigation params
  const setupFormHandler = (saveHandler) => {
    // Expose save handler to the header button via ref
    useImperativeHandle(screenRef, () => ({
      handleSave: saveHandler
    }));

    // Set the screen ref in navigation params so header can access it
    useEffect(() => {
      navigation.setParams({ screenRef });
    }, [navigation]);
  };

  // Fetch data on mount if editing
  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  return {
    // State
    itemToEdit,
    loading,
    isEditing,
    screenRef,
    
    // Handlers
    handleSaveOrUpdate,
    handleDelete,
    setupFormHandler,
    
    // Utils
    router,
    navigation,
    params,
  };
}