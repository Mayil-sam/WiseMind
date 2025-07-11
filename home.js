import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, StyleSheet, View, ActivityIndicator, Text } from 'react-native-web';
import { Appbar, DataTable, Searchbar, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

// --- MOCK DATA & API ---
// In a real app, this would be in a separate file.
// We are using a free public API for user data.
const API_URL = 'https://jsonplaceholder.typicode.com/users';

// --- THEME ---
// A slightly customized theme for a professional look.
const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
    background: '#f6f6f6',
  },
};

// --- Main App Component ---
const App = () => {
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState([]); // Stores the original full list of users
  const [loading, setLoading] = useState(true); // For loading indicator
  const [error, setError] = useState(null); // For error handling

  const [searchQuery, setSearchQuery] = useState(''); // For the search bar input

  // Sorting state
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('ascending'); // 'ascending' or 'descending'

  // Pagination state
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const itemsPerPageOptions = [5, 10, 15];


  // --- DATA FETCHING ---
  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUsers(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message);
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []); // Empty dependency array means this runs once on mount

  // --- LOGIC: SEARCHING, SORTING, PAGINATION ---
  const processedUsers = useMemo(() => {
    // This memoized value recalculates only when its dependencies change.

    let filteredUsers = [...users];

    // 1. Filtering based on search query
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(user =>
        user.name.toLowerCase().includes(lowercasedQuery)
      );
    }

    // 2. Sorting
    if (sortColumn) {
      filteredUsers.sort((a, b) => {
        // Handle nested properties like address.city
        const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => acc && acc[part], obj);
        
        const valA = (typeof getNestedValue(a, sortColumn) === 'string') ? getNestedValue(a, sortColumn).toLowerCase() : getNestedValue(a, sortColumn);
        const valB = (typeof getNestedValue(b, sortColumn) === 'string') ? getNestedValue(b, sortColumn).toLowerCase() : getNestedValue(b, sortColumn);


        if (valA < valB) {
          return sortDirection === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortDirection === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredUsers;
  }, [users, searchQuery, sortColumn, sortDirection]);

  const paginatedUsers = useMemo(() => {
      const from = page * itemsPerPage;
      const to = from + itemsPerPage;
      return processedUsers.slice(from, to);
  }, [page, itemsPerPage, processedUsers]);


  // --- HANDLERS ---
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'ascending' ? 'descending' : 'ascending'));
    } else {
      setSortColumn(column);
      setSortDirection('ascending');
    }
  };

  const handleSearch = (query) => {
      setSearchQuery(query);
      setPage(0); // Reset to first page on new search
  }

  // --- RENDER ---
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error fetching data: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="User Dashboard" subtitle="Manage and view user data" />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Search by name..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchbar}
          elevation={2}
        />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator animating={true} size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Fetching Users...</Text>
          </View>
        ) : (
          <DataTable style={styles.table}>
            <DataTable.Header style={styles.tableHeader}>
              <DataTable.Title sortDirection={sortColumn === 'name' ? sortDirection : null} onPress={() => handleSort('name')}>
                <Text style={styles.titleText}>Name</Text>
              </DataTable.Title>
              <DataTable.Title sortDirection={sortColumn === 'email' ? sortDirection : null} onPress={() => handleSort('email')}>
                 <Text style={styles.titleText}>Email</Text>
              </DataTable.Title>
              <DataTable.Title sortDirection={sortColumn === 'address.city' ? sortDirection : null} onPress={() => handleSort('address.city')}>
                 <Text style={styles.titleText}>City</Text>
              </DataTable.Title>
            </DataTable.Header>

            {paginatedUsers.map(user => (
              <DataTable.Row key={user.id} style={styles.row}>
                <DataTable.Cell>{user.name}</DataTable.Cell>
                <DataTable.Cell>{user.email}</DataTable.Cell>
                <DataTable.Cell>{user.address.city}</DataTable.Cell>
              </DataTable.Row>
            ))}

            <DataTable.Pagination
              page={page}
              numberOfPages={Math.ceil(processedUsers.length / itemsPerPage)}
              onPageChange={p => setPage(p)}
              label={`${page * itemsPerPage + 1}-${Math.min((page + 1) * itemsPerPage, processedUsers.length)} of ${processedUsers.length}`}
              numberOfItemsPerPageList={itemsPerPageOptions}
              numberOfItemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              showFastPaginationControls
              selectPageDropdownLabel={'Rows per page'}
            />
          </DataTable>
        )}
      </View>
    </SafeAreaView>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  appbar: {
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: 8,
  },
  searchbar: {
    marginBottom: 16,
    borderRadius: 8,
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  tableHeader: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  titleText: {
    fontWeight: 'bold',
    color: '#333',
  },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#555',
  },
  errorText: {
      color: 'red',
      fontWeight: 'bold',
  }
});

// --- Entry Point ---
// Wrap the main App with PaperProvider to apply the theme
export default function Main() {
  return (
    <PaperProvider theme={theme}>
      <App />
    </PaperProvider>
  );
}