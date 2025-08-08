/*
 * Mat Time - Martial Arts Training Session Tracking Application
 * Copyright (C) 2025 Kibum Park
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { useState, useRef, useImperativeHandle, useEffect } from 'react';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Alert } from 'react-native';
import { usePreventRemove } from '@react-navigation/native';
import apiClient from '../api/client';
import ErrorHandler from '../utils/errorHandler';

export default function useLogFormHandler(config) {
  const {
    endpoint, // e.g., 'sessions', 'seminars', 'competitions'
    itemName, // e.g., 'session', 'seminar', 'competition'
    validateData, // function to validate data before save
    transformDataForEdit, // function to transform API response for form state
    transformDataForSave, // function to transform form state for API
    hasUnsavedChanges, // function to check if form has unsaved changes
    markFormAsSaved, // function to mark form as saved (reset dirty state)
  } = config;

  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const screenRef = useRef();

  // Common state
  const [itemToEdit, setItemToEdit] = useState(null);
  const [loading, setLoading] = useState(!!params.id);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setSaving(true);
      if (isEditing) {
        await apiClient.put(`/${endpoint}/${itemToEdit._id}`, dataToSave);
      } else {
        await apiClient.post(`/${endpoint}`, dataToSave);
      }
      
      // Mark form as saved to prevent unsaved changes warning
      if (markFormAsSaved) {
        markFormAsSaved();
      }
      
      router.back();
    } catch (error) {
      ErrorHandler.save(itemName, error);
    } finally {
      setSaving(false);
    }
  };

  // Generic delete handler
  const handleDelete = async () => {
    ErrorHandler.confirmDelete(`${itemName} log`, null, async () => {
      try {
        setDeleting(true);
        await apiClient.delete(`/${endpoint}/${itemToEdit._id}`);
        router.back();
      } catch (error) {
        ErrorHandler.delete(itemName, error);
      } finally {
        setDeleting(false);
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

  // Prevent navigation if there are unsaved changes
  usePreventRemove(
    hasUnsavedChanges && typeof hasUnsavedChanges === 'function' && hasUnsavedChanges(),
    ({ data }) => {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them and leave the screen?',
        [
          { 
            text: "Don't leave", 
            style: 'cancel', 
            onPress: () => {} 
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              // Mark as saved to prevent further warnings and allow navigation
              if (markFormAsSaved) {
                markFormAsSaved();
              }
              navigation.dispatch(data.action);
            },
          },
        ]
      );
    }
  );

  return {
    // State
    itemToEdit,
    loading,
    saving,
    deleting,
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