'use client'
import { useState, useEffect } from 'react'
import { firestore } from '@/firebase'
import { Box, Modal, Typography, Stack, TextField, Button, Grid, Paper, ThemeProvider, createTheme } from "@mui/material"
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore'
import { keyframes } from '@emotion/react'

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [itemName, setItemName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [quantityToAdd, setQuantityToAdd] = useState(1)
  const [quantityToRemove, setQuantityToRemove] = useState(1)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      })
    })
    setInventory(inventoryList)
  }

  const addItem = async (item, quantity = 1) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: currentQuantity + quantity })
    } else {
      await setDoc(docRef, { quantity })
    }
    await updateInventory()
  }

  const removeItem = async (item, quantity = 1) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const { quantity: currentQuantity } = docSnap.data()
      if (currentQuantity <= quantity) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: currentQuantity - quantity })
      }
    }
    await updateInventory()
  }

  const editItemName = async (oldName, newName) => {
    const oldDocRef = doc(collection(firestore, 'inventory'), oldName)
    const newDocRef = doc(collection(firestore, 'inventory'), newName)
    const docSnap = await getDoc(oldDocRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      await deleteDoc(oldDocRef)
      await setDoc(newDocRef, data)
    }
    await updateInventory()
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const handleOpenAdd = () => setOpenAdd(true)
  const handleCloseAdd = () => setOpenAdd(false)

  const handleOpenEdit = (name) => {
    setItemName(name)
    setEditItem(name)
    setOpenEdit(true)
  }

  const handleCloseEdit = () => {
    setEditItem(null)
    setOpenEdit(false)
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#90caf9',
      },
      secondary: {
        main: '#f48fb1',
      },
      background: {
        default: '#121212',
        paper: '#1d1d1d',
      },
      text: {
        primary: '#ffffff',
        secondary: '#aaaaaa',
      },
    },
  })

  const fadeIn = keyframes`
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  `

  const scaleUp = keyframes`
    from {
      transform: translate(-50%, -50%) scale(0.95);
    }
    to {
      transform: translate(-50%, -50%) scale(1);
    }
  `

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        width="100vw"
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="center"
        gap={2}
        sx={{ padding: 3, bgcolor: 'background.default', animation: `${fadeIn} 1s ease-in-out` }}
      >
        <Typography variant="h2" color="primary.main" gutterBottom sx={{ marginBottom: 4 }}>
          Pantry Tracker
        </Typography>

        {/* Add Item Modal */}
        <Modal open={openAdd} onClose={handleCloseAdd}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="background.paper"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
              animation: `${scaleUp} 0.5s ease-in-out`
            }}
          >
            <Typography variant="h6">Add Item</Typography>
            <Stack direction="column" spacing={2}>
              <TextField
                variant='outlined'
                label="Item Name"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <TextField
                type="number"
                variant='outlined'
                size="small"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(Number(e.target.value))}
                placeholder="Add Quantity"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addItem(itemName, quantityToAdd)
                  setItemName('')
                  setQuantityToAdd(1)
                  handleCloseAdd()
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        {/* Edit Item Modal */}
        <Modal open={openEdit} onClose={handleCloseEdit}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            width={400}
            bgcolor="background.paper"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            display="flex"
            flexDirection="column"
            gap={3}
            sx={{
              transform: "translate(-50%, -50%)",
              animation: `${scaleUp} 0.5s ease-in-out`
            }}
          >
            <Typography variant="h6">Edit Item</Typography>
            <TextField
              variant='outlined'
              label="New Item Name"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                editItemName(editItem, itemName)
                setItemName('')
                handleCloseEdit()
              }}
            >
              Save
            </Button>
          </Box>
        </Modal>

        <Stack direction="column" spacing={2} mb={2} width="100%" maxWidth={800}>
          <Button variant="contained" color="primary" onClick={handleOpenAdd}>
            Add New Item
          </Button>
          <TextField
            variant="outlined"
            placeholder="Search Items"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ color: 'text.primary' }}
          />
        </Stack>

        <Paper elevation={3} sx={{ width: '100%', maxWidth: 800, padding: 2, bgcolor: 'background.paper', color: 'text.primary' }}>
          <Box
            width="100%"
            height="100px"
            bgcolor="#37474f"
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
            borderRadius={1}
            padding={2}
          >
            <Typography variant='h5' color="text.primary" sx={{ textAlign: 'center', wordBreak: 'break-word' }}>
              Pantry Items
            </Typography>
          </Box>

          <Grid container spacing={2} sx={{ maxHeight: '500px', overflow: 'auto' }}>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item) => (
                <Grid item xs={12} sm={6} key={item.name}>
                  <Paper
                    elevation={2}
                    sx={{
                      padding: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      height: '280px',
                      bgcolor: "#333",
                      borderRadius: 1,
                      animation: `${fadeIn} 0.5s ease-in-out`
                    }}
                  >
                    <Box sx={{ width: '100%', mb: 2 }}>
                      <Typography 
                        variant='h6' 
                        color="text.primary" 
                        sx={{
                          textAlign: 'center',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography variant='body1' color="text.secondary" textAlign="center">
                        Quantity: {item.quantity}
                      </Typography>
                    </Box>
                    <Stack direction="column" spacing={1} width="100%">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => addItem(item.name, quantityToAdd)}
                          sx={{ minWidth: '80px' }}
                        >
                          Add
                        </Button>
                        <TextField
                          type="number"
                          variant='outlined'
                          size="small"
                          value={quantityToAdd}
                          onChange={(e) => setQuantityToAdd(Number(e.target.value))}
                          placeholder="Quantity"
                          sx={{ flexGrow: 1 }}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => removeItem(item.name, quantityToRemove)}
                          sx={{ minWidth: '80px' }}
                        >
                          Remove
                        </Button>
                        <TextField
                          type="number"
                          variant='outlined'
                          size="small"
                          value={quantityToRemove}
                          onChange={(e) => setQuantityToRemove(Number(e.target.value))}
                          placeholder="Quantity"
                          sx={{ flexGrow: 1 }}
                        />
                      </Stack>
                      <Button
                        variant="outlined"
                        color="warning"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
                            deleteDoc(doc(collection(firestore, 'inventory'), item.name))
                            updateInventory()
                          }
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleOpenEdit(item.name)}
                      >
                        Edit
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography variant='h6' color="text.secondary" textAlign="center">
                  No items found.
                </Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
      </Box>
    </ThemeProvider>
  )
}











