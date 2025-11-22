'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { PatientTest } from '@/lib/api/tests'
import { EncounterDetail } from '@/lib/api/encounters'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '2 solid #1e293b',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d4c73',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 15,
  },
  reportDate: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1 solid #e2e8f0',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    width: '30%',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 11,
    color: '#1e293b',
    width: '70%',
    fontWeight: 'bold',
  },
  valueNormal: {
    fontSize: 11,
    color: '#1e293b',
    width: '70%',
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  vitalItem: {
    width: '50%',
    marginBottom: 8,
  },
  vitalLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 11,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  textBlock: {
    marginTop: 8,
    lineHeight: 1.6,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '2 solid #1e293b',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 5,
  },
})

interface TestReportPDFProps {
  test: PatientTest
  encounter: EncounterDetail | null
  patientName?: string
}

const TestReportPDF = ({ test, encounter, patientName }: TestReportPDFProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateOnly = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View>
              <Text style={styles.title}>HELIX EMR</Text>
              <Text style={styles.subtitle}>Medical Test Report</Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={styles.reportDate}>Report Date</Text>
              <Text style={{ fontSize: 10, color: '#1e293b', fontWeight: 'bold', marginTop: 2 }}>
                {formatDate(test.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Test Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Test Name</Text>
            <Text style={styles.value}>{test.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Test ID</Text>
            <Text style={styles.valueNormal}>{test.unique_id}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Result</Text>
            <Text style={styles.value}>{test.result || '—'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date Performed</Text>
            <Text style={styles.valueNormal}>{formatDate(test.created_at)}</Text>
          </View>
          {patientName && (
            <View style={styles.row}>
              <Text style={styles.label}>Patient</Text>
              <Text style={styles.valueNormal}>{patientName}</Text>
            </View>
          )}
        </View>

        {/* Encounter Information */}
        {encounter && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Encounter Details</Text>
            
            {encounter.unique_id && (
              <View style={styles.row}>
                <Text style={styles.label}>Encounter ID</Text>
                <Text style={styles.valueNormal}>{encounter.unique_id}</Text>
              </View>
            )}
            
            {(encounter.date || encounter.created_at) && (
              <View style={styles.row}>
                <Text style={styles.label}>Encounter Date</Text>
                <Text style={styles.valueNormal}>
                  {formatDate(encounter.date || encounter.created_at || '')}
                </Text>
              </View>
            )}

            {encounter.consultation_reason && (
              <View style={styles.row}>
                <Text style={styles.label}>Consultation Reason</Text>
                <Text style={styles.valueNormal}>{encounter.consultation_reason}</Text>
              </View>
            )}

            {/* Vitals */}
            {(encounter.vitals && Array.isArray(encounter.vitals) && encounter.vitals.length > 0) ||
             encounter.blood_pressure || encounter.heart_rate || encounter.temperature ||
             encounter.weight || encounter.height || encounter.bmi ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#475569', marginBottom: 8 }}>
                  Vital Signs
                </Text>
                <View style={styles.vitalsGrid}>
                  {encounter.weight && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Weight</Text>
                      <Text style={styles.vitalValue}>{encounter.weight}</Text>
                    </View>
                  )}
                  {encounter.height && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Height</Text>
                      <Text style={styles.vitalValue}>{encounter.height}</Text>
                    </View>
                  )}
                  {encounter.bmi && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>BMI</Text>
                      <Text style={styles.vitalValue}>{encounter.bmi}</Text>
                    </View>
                  )}
                  {encounter.blood_pressure && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Blood Pressure</Text>
                      <Text style={styles.vitalValue}>{encounter.blood_pressure}</Text>
                    </View>
                  )}
                  {encounter.heart_rate && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Heart Rate</Text>
                      <Text style={styles.vitalValue}>{encounter.heart_rate}</Text>
                    </View>
                  )}
                  {encounter.temperature && (
                    <View style={styles.vitalItem}>
                      <Text style={styles.vitalLabel}>Temperature</Text>
                      <Text style={styles.vitalValue}>{encounter.temperature}</Text>
                    </View>
                  )}
                </View>
              </View>
            ) : null}

            {/* Symptoms */}
            {encounter.symptoms && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#475569', marginBottom: 5 }}>
                  Symptoms
                </Text>
                <Text style={styles.textBlock}>
                  {Array.isArray(encounter.symptoms) 
                    ? encounter.symptoms.join(', ') 
                    : encounter.symptoms}
                </Text>
              </View>
            )}

            {/* Diagnosis */}
            {encounter.diagnosis && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#475569', marginBottom: 5 }}>
                  Diagnosis
                </Text>
                <Text style={styles.textBlock}>{encounter.diagnosis}</Text>
              </View>
            )}

            {/* Summary */}
            {encounter.summary && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#475569', marginBottom: 5 }}>
                  Summary
                </Text>
                <Text style={styles.textBlock}>{encounter.summary}</Text>
              </View>
            )}

            {/* Notes */}
            {encounter.note && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#475569', marginBottom: 5 }}>
                  Clinical Notes
                </Text>
                <Text style={styles.textBlock}>{encounter.note}</Text>
              </View>
            )}

            {/* Follow-up */}
            {encounter.follow_up && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#475569', marginBottom: 5 }}>
                  Follow-up
                </Text>
                <Text style={styles.textBlock}>{encounter.follow_up}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This is an official medical test report from HELIX EMR
          </Text>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

interface TestReportPDFDownloadProps {
  test: PatientTest
  encounter: EncounterDetail | null
  patientName?: string
  children?: (props: { loading: boolean }) => React.ReactNode
}

export function TestReportPDFDownload({ test, encounter, patientName, children }: TestReportPDFDownloadProps) {
  const fileName = `test-report-${test.unique_id || test.id}-${new Date().toISOString().split('T')[0]}.pdf`
  
  return (
    <PDFDownloadLink
      document={<TestReportPDF test={test} encounter={encounter} patientName={patientName} />}
      fileName={fileName}
    >
      {({ loading }) => (
        children ? children({ loading }) : <span>{loading ? 'Generating PDF...' : 'Download PDF'}</span>
      )}
    </PDFDownloadLink>
  )
}

export default TestReportPDF

