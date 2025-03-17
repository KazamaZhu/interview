<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'

// Form data
const form = reactive({
  name: '',
  region: '',
  date: '',
  delivery: false,
  type: [],
  resource: '',
  desc: ''
})

// Form rules
const rules = reactive({
  name: [
    { required: true, message: 'Please input name', trigger: 'blur' },
    { min: 3, max: 15, message: 'Length should be 3 to 15', trigger: 'blur' }
  ],
  region: [
    { required: true, message: 'Please select region', trigger: 'change' }
  ],
  date: [
    { required: true, message: 'Please pick a date', trigger: 'change' }
  ],
  type: [
    { type: 'array', required: true, message: 'Please select at least one activity type', trigger: 'change' }
  ],
  resource: [
    { required: true, message: 'Please select resource', trigger: 'change' }
  ],
  desc: [
    { required: true, message: 'Please input description', trigger: 'blur' }
  ]
})

// Form ref
const formRef = ref(null)

// Table data
const tableData = [
  {
    date: '2023-05-03',
    name: 'Tom',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    date: '2023-05-02',
    name: 'John',
    address: '932 Washington Ave, Seattle',
  },
  {
    date: '2023-05-04',
    name: 'Morgan',
    address: '1298 Pine St, San Francisco',
  },
  {
    date: '2023-05-01',
    name: 'Jessy',
    address: '4602 Cedar Ave, Dallas',
  },
]

// Dialog visibility
const dialogVisible = ref(false)

// Methods
const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      ElMessage({
        message: 'Form submitted successfully!',
        type: 'success',
      })
      console.log('submit!', form)
    } else {
      console.log('error submit!', fields)
    }
  })
}

const resetForm = (formEl) => {
  if (!formEl) return
  formEl.resetFields()
}

const showNotification = () => {
  ElNotification({
    title: 'Success',
    message: 'This is a success notification',
    type: 'success',
  })
}
</script>

<template>
  <div class="element-demo">
    <el-card class="demo-card">
      <template #header>
        <div class="card-header">
          <span>Element Plus Demo</span>
          <el-button type="primary" @click="showNotification">
            <el-icon><Bell /></el-icon>
            Notification
          </el-button>
        </div>
      </template>
      
      <el-tabs type="border-card">
        <el-tab-pane label="Form">
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-width="120px"
            class="demo-form"
          >
            <el-form-item label="Name" prop="name">
              <el-input v-model="form.name" />
            </el-form-item>
            
            <el-form-item label="Region" prop="region">
              <el-select v-model="form.region" placeholder="Please select a region">
                <el-option label="Zone One" value="zone-1" />
                <el-option label="Zone Two" value="zone-2" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="Date" prop="date">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="Pick a date"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="Delivery" prop="delivery">
              <el-switch v-model="form.delivery" />
            </el-form-item>
            
            <el-form-item label="Activity type" prop="type">
              <el-checkbox-group v-model="form.type">
                <el-checkbox label="Online activities" name="type" />
                <el-checkbox label="Promotion activities" name="type" />
                <el-checkbox label="Offline activities" name="type" />
                <el-checkbox label="Simple brand exposure" name="type" />
              </el-checkbox-group>
            </el-form-item>
            
            <el-form-item label="Resources" prop="resource">
              <el-radio-group v-model="form.resource">
                <el-radio label="Sponsorship" />
                <el-radio label="Venue" />
              </el-radio-group>
            </el-form-item>
            
            <el-form-item label="Description" prop="desc">
              <el-input
                v-model="form.desc"
                type="textarea"
                rows="3"
                placeholder="Please input description"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitForm(formRef)">
                Submit
              </el-button>
              <el-button @click="resetForm(formRef)">Reset</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="Table">
          <el-table :data="tableData" style="width: 100%">
            <el-table-column prop="date" label="Date" width="180" />
            <el-table-column prop="name" label="Name" width="180" />
            <el-table-column prop="address" label="Address" />
            <el-table-column fixed="right" label="Operations" width="120">
              <template #default>
                <el-button link type="primary" size="small" @click="dialogVisible = true">
                  Detail
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <el-tab-pane label="Components">
          <div class="component-demo">
            <div class="component-section">
              <h3>Buttons</h3>
              <div class="button-container">
                <el-button>Default</el-button>
                <el-button type="primary">Primary</el-button>
                <el-button type="success">Success</el-button>
                <el-button type="info">Info</el-button>
                <el-button type="warning">Warning</el-button>
                <el-button type="danger">Danger</el-button>
              </div>
            </div>
            
            <div class="component-section">
              <h3>Progress</h3>
              <el-progress :percentage="50" />
              <el-progress :percentage="80" color="#8e44ad" />
              <el-progress :percentage="100" status="success" />
            </div>
            
            <div class="component-section">
              <h3>Alert</h3>
              <el-alert title="Success Alert" type="success" />
              <el-alert title="Warning Alert" type="warning" class="mt-10" />
              <el-alert title="Error Alert" type="error" class="mt-10" />
              <el-alert title="Info Alert" type="info" class="mt-10" />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <el-dialog
      v-model="dialogVisible"
      title="Details"
      width="30%"
    >
      <span>This is a dialog with additional details.</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancel</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            Confirm
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.element-demo {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.demo-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-form {
  max-width: 600px;
}

.component-demo {
  padding: 20px 0;
}

.component-section {
  margin-bottom: 30px;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.mt-10 {
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 