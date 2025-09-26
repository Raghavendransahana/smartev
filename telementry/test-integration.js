#!/usr/bin/env node
/**
 * SmartEV Battery Twin Integration Test
 * Tests the Express + ML Models integration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8000';

class IntegrationTester {
    constructor() {
        this.results = [];
    }
    
    async test(name, testFunction) {
        console.log(`\n🧪 Testing: ${name}`);
        console.log('─'.repeat(50));
        
        try {
            const result = await testFunction();
            console.log('✅ PASSED:', name);
            this.results.push({ name, status: 'PASSED', result });
            return result;
        } catch (error) {
            console.log('❌ FAILED:', name);
            console.log('Error:', error.message);
            this.results.push({ name, status: 'FAILED', error: error.message });
            return null;
        }
    }
    
    async testHealthCheck() {
        const response = await axios.get(`${BASE_URL}/health`);
        console.log('Response:', response.data);
        return response.data;
    }
    
    async testBatteryPrediction() {
        const batteryData = {
            voltage: 3.7,
            current: 2.2,
            temperature: 28,
            soc: 85,
            capacity: 2.5,
            cycle_count: 150
        };
        
        const response = await axios.post(`${BASE_URL}/api/battery/predict`, batteryData);
        console.log('Battery Prediction Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    }
    
    async testSOHPrediction() {
        const batteryData = {
            voltage: 3.6,
            current: 1.8,
            temperature: 25,
            capacity: 2.4,
            cycle_count: 200
        };
        
        const response = await axios.post(`${BASE_URL}/api/battery/soh`, batteryData);
        console.log('SOH Prediction Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    }
    
    async testRULPrediction() {
        const batteryData = {
            voltage: 3.7,
            current: 2.0,
            temperature: 27,
            soc: 80,
            soh: 85
        };
        
        const response = await axios.post(`${BASE_URL}/api/battery/rul`, batteryData);
        console.log('RUL Prediction Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    }
    
    async testTripSimulation() {
        const tripData = {
            duration_minutes: 30,
            type: 'city',
            initial_soc: 90
        };
        
        const response = await axios.post(`${BASE_URL}/api/battery/simulate`, tripData);
        console.log('Trip Simulation Response (summary):', {
            success: response.data.success,
            duration: response.data.data?.trip_simulation?.duration_minutes,
            dataPoints: response.data.data?.trip_simulation?.data_points,
            summary: response.data.data?.trip_simulation?.summary
        });
        return response.data;
    }
    
    async testModelStatus() {
        const response = await axios.get(`${BASE_URL}/api/models/status`);
        console.log('Model Status Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    }
    
    async testBatteryAnalysis() {
        const batteryData = {
            voltage: 3.65,
            current: 2.1,
            temperature: 29,
            soc: 78,
            capacity: 2.3,
            cycle_count: 180,
            battery_id: 'test-battery-001'
        };
        
        const response = await axios.post(`${BASE_URL}/api/battery/analyze`, batteryData);
        console.log('Battery Analysis Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    }
    
    async runAllTests() {
        console.log('🔋 SmartEV Battery Twin - Integration Tests');
        console.log('='.repeat(60));
        
        // Wait a moment for server to be ready
        console.log('⏳ Waiting for server to be ready...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await this.test('Health Check', () => this.testHealthCheck());
        await this.test('Model Status Check', () => this.testModelStatus());
        await this.test('SOH Prediction', () => this.testSOHPrediction());
        await this.test('RUL Prediction', () => this.testRULPrediction());
        await this.test('Complete Battery Prediction', () => this.testBatteryPrediction());
        await this.test('Battery Analysis (Enhanced)', () => this.testBatteryAnalysis());
        await this.test('Trip Simulation', () => this.testTripSimulation());
        
        // Results summary
        this.printSummary();
    }
    
    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📊 Total:  ${this.results.length}`);
        
        if (failed > 0) {
            console.log('\n❌ Failed Tests:');
            this.results
                .filter(r => r.status === 'FAILED')
                .forEach(r => console.log(`   • ${r.name}: ${r.error}`));
        }
        
        console.log('\n🎯 Integration Status:', failed === 0 ? '✅ FULLY OPERATIONAL' : '⚠️  NEEDS ATTENTION');
        
        if (passed === this.results.length) {
            console.log('\n🎉 All systems operational! Battery Twin is ready for production.');
            console.log('🌐 Dashboard: http://localhost:8000/dashboard');
        }
    }
}

// Run tests
const tester = new IntegrationTester();
tester.runAllTests().catch(error => {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
});