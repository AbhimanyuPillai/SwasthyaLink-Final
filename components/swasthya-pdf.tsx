import React from "react"
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer"

// Register font for better look
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf'
})

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  card: {
    width: 320,
    borderWidth: 1,
    borderColor: "#0F172A4D",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  stripeContainer: {
    height: 4,
    flexDirection: "row",
  },
  stripeOrange: { flex: 1, backgroundColor: "#F97316" },
  stripeWhite: { flex: 1, backgroundColor: "#FFFFFF" },
  stripeGreen: { flex: 1, backgroundColor: "#10B981" },
  header: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  logo: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  body: {
    padding: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  photoContainer: {
    width: 60,
    height: 75,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  photo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  infoContainer: {
    flex: 1,
  },
  label: {
    fontSize: 7,
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 1,
  },
  value: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 6,
  },
  grid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 6,
  },
  gridItem: {
    flex: 1,
  },
  bloodValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#B91C1C",
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  idText: {
    fontSize: 10,
    fontFamily: "Courier",
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: 1,
  },
  qrContainer: {
    width: 60,
    height: 60,
    padding: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
  },
  qrCode: {
    width: "100%",
    height: "100%",
  }
})

interface SwasthyaPDFProps {
  data: {
    name: string
    dob: string
    gender: string
    bloodType: string
    swasthyaId: string
    avatar: string
    qrCodeBase64?: string
  }
}

export const SwasthyaPDF = ({ data }: SwasthyaPDFProps) => {
  const genderChar = data.gender?.toLowerCase() === "male" ? "M" : 
                    data.gender?.toLowerCase() === "female" ? "F" : 
                    data.gender?.toLowerCase() === "other" ? "O" : 
                    data.gender || "-"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          {/* Tricolor Stripe */}
          <View style={styles.stripeContainer}>
            <View style={styles.stripeOrange} />
            <View style={styles.stripeWhite} />
            <View style={styles.stripeGreen} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>SWASTHYA LINK</Text>
            <View style={styles.logo}>
              <Text style={styles.logoText}>S</Text>
            </View>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.row}>
              {/* Photo */}
              <View style={styles.photoContainer}>
                {data.avatar && <Image src={data.avatar} style={styles.photo} />}
              </View>

              {/* Info */}
              <View style={styles.infoContainer}>
                <View>
                  <Text style={styles.label}>Name / नाम</Text>
                  <Text style={styles.value}>{data.name}</Text>
                </View>
                <View style={styles.grid}>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>DOB</Text>
                    <Text style={styles.value}>{data.dob}</Text>
                  </View>
                  <View style={styles.gridItem}>
                    <Text style={styles.label}>Gender</Text>
                    <Text style={styles.value}>{genderChar}</Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.label}>Blood Group</Text>
                  <Text style={styles.bloodValue}>{data.bloodType}</Text>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View>
                <Text style={styles.label}>Swasthya ID</Text>
                <Text style={styles.idText}>{data.swasthyaId}</Text>
              </View>
              <View style={styles.qrContainer}>
                {data.qrCodeBase64 && <Image src={data.qrCodeBase64} style={styles.qrCode} />}
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}
