"use client"

import React, { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import {
  Mail,
  Phone,
  Building2,
  MapPin,
  Briefcase,
  UserRound,
  User2,
  CreditCard,
  FileText,
  Upload,
  Calendar,
  Banknote,
  Home,
  PhoneForwarded,
  User,
  Users,
  Copy,
} from "lucide-react"
import html2canvas from "html2canvas"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import axios from "axios"
import { useToast } from "@/components/ui/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const Profile = () => {
  const { user, updateUserInContext } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState(user?.phone || "")
  const [companyName, setCompanyName] = useState(user?.companyName || "")
  const [address, setAddress] = useState(user?.address || "")
  const [licenseNumber, setLicenseNumber] = useState(user?.licenseNumber || "")

  // New state variables for additional information
  const [bankName, setBankName] = useState(user?.bankName || "")
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || "")
  const [ifscCode, setIfscCode] = useState(user?.ifscCode || "")
  const [panNumber, setPanNumber] = useState(user?.panNumber || "")
  const [aadharNumber, setAadharNumber] = useState(user?.aadharNumber || "")
  const [experience, setExperience] = useState(user?.experience || "")
  const [specialization, setSpecialization] = useState(user?.specialization || "")
  const [languages, setLanguages] = useState(user?.languages || "")
  const [bio, setBio] = useState(user?.bio || "")
  const [kycDocuments, setKycDocuments] = useState<{
    panCard?: string
    aadharCardFront?: string
    aadharCardBack?: string
    addressProof?: string
    profilePhoto?: string
    licenseDocument?: string
  }>({})

  // State for personal information
  const [dateOfBirth, setDateOfBirth] = useState<string>("")
  const [gender, setGender] = useState<string>("")
  const [alternatePhone, setAlternatePhone] = useState<string>("")
  const [bloodGroup, setBloodGroup] = useState<string>("")

  // State for address information
  const [streetAddress, setStreetAddress] = useState<string>("")
  const [landmark, setLandmark] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [state, setState] = useState<string>("")
  const [pincode, setPincode] = useState<string>("")
  const [country, setCountry] = useState<string>("India")

  // Add new state for tracking which form is being submitted
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null)

  // KYC Documents state
  const [aadharCard, setAadharCard] = useState<File | null>(null)
  const [panCard, setPanCard] = useState<File | null>(null)
  const [passport, setPassport] = useState<File | null>(null)
  const [drivingLicense, setDrivingLicense] = useState<File | null>(null)
  const [voterId, setVoterId] = useState<File | null>(null)
  const [otherDocument, setOtherDocument] = useState<File | null>(null)

  // KYC Documents refs
  const aadharCardRef = useRef<HTMLInputElement>(null)
  const panCardRef = useRef<HTMLInputElement>(null)
  const passportRef = useRef<HTMLInputElement>(null)
  const drivingLicenseRef = useRef<HTMLInputElement>(null)
  const voterIdRef = useRef<HTMLInputElement>(null)
  const otherDocumentRef = useRef<HTMLInputElement>(null)

  // Add new state for team members
  const [teamMembers, setTeamMembers] = useState([])
  const [loadingTeam, setLoadingTeam] = useState(false)

  // Add new state for holderName
  const [holderName, setHolderName] = useState(user?.holderName || "")

  // Add new state for Aadhar Card Front and Back
  const [aadharCardFront, setAadharCardFront] = useState<File | null>(null)
  const [aadharCardBack, setAadharCardBack] = useState<File | null>(null)

  useEffect(() => {
    // Remove authentication check since ProtectedRoute handles it
  }, [user, navigate])

  // Add new useEffect to sync local state with user data
  useEffect(() => {
    if (user) {
      console.log("DEBUG - Profile - User data changed, updating local state:", user)
      setFirstName(user.firstName || "")
      setLastName(user.lastName || "")
      setEmail(user.email || "")
      setPhone(user.phone || "")
      setBio(user.bio || "")
      setLanguages(user.languages || "")
      setExperience(user.experience || "")
      setSpecialization(user.specialization || "")
      setBankName(user.bankName || "")
      setAccountNumber(user.accountNumber || "")
      setIfscCode(user.ifscCode || "")
      setPanNumber(user.panNumber || "")
      setAadharNumber(user.aadharNumber || "")
      setDateOfBirth(user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "")
      setGender(user.gender || "")
      setAlternatePhone(user.alternatePhone || "")
      setStreetAddress(user.streetAddress || "")
      setCity(user.city || "")
      setState(user.state || "")
      setPincode(user.pincode || "")
      setCountry(user.country || "India")
      setLandmark(user.landmark || "")
      setBloodGroup(user.bloodGroup || "")
      setHolderName(user.holderName || "")

      if (user.userType === "company") {
        setCompanyName(user.companyName || "")
        setAddress(user.address || "")
        setLicenseNumber(user.licenseNumber || "")
      }

      if (user.documents) {
        setKycDocuments(user.documents)
      }
    }
  }, [user])

  // Add new useEffect to fetch team members for agents and companies
  useEffect(() => {
    if (user && (user.userType === "agent" || user.userType === "company")) {
      fetchTeamMembers()
    }
  }, [user])

  // Helper function to convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // Helper function to validate file size (5MB limit)
  const validateFileSize = (file: File): boolean => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    return file.size <= maxSize
  }

  // Helper function to validate file type
  const validateFileType = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"]
    return allowedTypes.includes(file.type)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    const file = e.target.files?.[0] || null
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size should be less than 5MB",
          variant: "destructive",
        })
        e.target.value = "" // Clear the input
        return
      }
      // Validate file type (only images and PDFs)
      if (!file.type.match(/^(image\/|application\/pdf)/)) {
        toast({
          title: "Error",
          description: "Only images and PDF files are allowed",
          variant: "destructive",
        })
        e.target.value = "" // Clear the input
        return
      }
      setter(file)
    }
  }

  // Add separate update handlers for each tab
  const handlePersonalInfoUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting("personal")

    try {
      // Create a plain object instead of FormData since we're not uploading files
      const updateData = {
        firstName,
        lastName,
        phone,
        dateOfBirth,
        gender,
        alternatePhone,
        bloodGroup,
        streetAddress,
        landmark,
        city,
        state,
        pincode,
        country,
        ...(user?.userType === "company" && {
          companyName,
          address,
          licenseNumber,
        }),
      }

      console.log("DEBUG - Profile - Sending update request with data:", updateData)

      const response = await axios.patch(
        `http://localhost:5000/api/users/updateMe`,
        updateData, // Send as JSON instead of FormData
        {
          headers: {
            "Content-Type": "application/json", // Change content type to JSON
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      )

      console.log("DEBUG - Profile - Update response:", response.data)

      if (response.data.success) {
        console.log("DEBUG - Profile - Updating user context with:", response.data.data)
        updateUserInContext(response.data.data)
        toast({
          title: "Success",
          description: "Personal information updated successfully!",
          variant: "default",
        })
      }
    } catch (err: any) {
      console.error("DEBUG - Profile - Update error:", err)
      const errorMessage = err.response?.data?.message || "Failed to update personal information."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(null)
    }
  }

  const handleBankingUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting("banking")

    try {
      // Create a plain object for banking data
      const updateData = {
        holderName,
        bankName,
        accountNumber,
        ifscCode,
      }

      console.log("DEBUG - Profile - Sending banking update request with data:", updateData)

      const response = await axios.patch(`http://localhost:5000/api/users/updateMe`, updateData, {
          headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("DEBUG - Profile - Banking update response:", response.data)

      if (response.data.success) {
        console.log("DEBUG - Profile - Updating user context with banking data:", response.data.data)
        updateUserInContext(response.data.data)
        toast({
          title: "Success",
          description: "Banking details updated successfully!",
          variant: "default",
        })
      }
    } catch (err: any) {
      console.error("DEBUG - Profile - Banking update error:", err)
      const errorMessage = err.response?.data?.message || "Failed to update banking details."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(null)
    }
  }

  const handleKycUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting("kyc")

    try {
      const formData = new FormData()
      // KYC documents
      if (panCard) formData.append("panCard", panCard)
      if (aadharCardFront) formData.append("aadharCardFront", aadharCardFront)
      if (aadharCardBack) formData.append("aadharCardBack", aadharCardBack)
      // KYC text fields
      formData.append("panNumber", panNumber)
      formData.append("aadharNumber", aadharNumber)

      // Log the form data entries for debugging
      console.log("DEBUG - Profile - Form data entries:")
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1])
      }

      const response = await axios.patch(`http://localhost:5000/api/users/updateMe`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      console.log("DEBUG - Profile - KYC update response:", response.data)

      if (response.data.success) {
        updateUserInContext(response.data.data)
        // Clear file inputs after successful upload
        setPanCard(null)
        setAadharCardFront(null)
        setAadharCardBack(null)
        if (panCardRef.current) panCardRef.current.value = ""
        toast({
          title: "Success",
          description: "KYC documents uploaded successfully!",
          variant: "default",
        })
      }
    } catch (err: any) {
      console.error("DEBUG - Profile - KYC update error:", err)
      const errorMessage = err.response?.data?.message || "Failed to upload KYC documents."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(null)
    }
  }

  const handleProfessionalUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting("professional")

    try {
      const formData = new FormData()
      
      // Professional information
      if (bio) formData.append("bio", bio)
      if (languages) formData.append("languages", languages)
      if (experience) formData.append("experience", experience.toString())
      if (specialization) formData.append("specialization", specialization)

      const response = await axios.patch(`http://localhost:5000/api/users/updateMe`, formData, {
          headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.data.success) {
        updateUserInContext(response.data.data)
        toast({
          title: "Success",
          description: "Professional information updated successfully!",
          variant: "default",
        })
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to update professional information."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(null)
    }
  }

  // Function to display uploaded documents
  const renderDocumentPreview = (documentType: keyof typeof kycDocuments) => {
    const document = kycDocuments[documentType]
    if (!document) return null

    if (document.startsWith("data:application/pdf")) {
      return (
        <div className="mt-2">
          <a 
            href={document} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            View PDF
          </a>
        </div>
      )
    }

    return (
      <div className="mt-2">
        <img 
          src={document || "/placeholder.svg"}
          alt={`${documentType} preview`} 
          className="max-w-[200px] max-h-[200px] object-contain rounded-lg border border-gray-200"
        />
      </div>
    )
  }

  // Update the document upload sections in the form to show previews
  const renderDocumentUpload = (label: string, documentType: keyof typeof kycDocuments) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          ref={aadharCardRef}
          onChange={(e) => handleFileChange(e, setAadharCard)}
          accept="image/*,.pdf"
        />
        <Label
          htmlFor={documentType}
          className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
        >
          <Upload className="h-4 w-4" />
          Upload {label}
        </Label>
      </div>
      {renderDocumentPreview(documentType)}
    </div>
  )

  const generateVisitingCard = async () => {
    const cardElement = document.getElementById("visiting-card-content")
    if (cardElement) {
      const canvas = await html2canvas(cardElement, { scale: 2 })
      const image = canvas.toDataURL("image/png")
      // For demonstration, you can open the image in a new tab
      const newWindow = window.open("")
      if (newWindow) {
        newWindow.document.write(`<img src="${image}" alt="Visiting Card"/>`)
      }
      // In a real app, you might offer download or direct share options
      toast({
        title: "Success",
        description: "Visiting card generated!",
        variant: "default",
      })
    } else {
      toast({
        title: "Error",
        description: "Could not generate visiting card.",
        variant: "destructive",
      })
    }
  }

  const shareVisitingCard = () => {
    // This is a placeholder. Real sharing would depend on platform APIs.
    // For web, you might use the Web Share API or copy to clipboard.
    if (navigator.share) {
      navigator
        .share({
        title: `${firstName} ${lastName}'s Visiting Card`,
        text: `Check out ${firstName} ${lastName}'s professional visiting card!\nEmail: ${email}\nPhone: ${phone}\nCompany: ${companyName}`,
        url: window.location.href, // Or a URL to the generated card image
        })
        .then(() => {
        toast({
          title: "Success",
          description: "Visiting card shared successfully!",
          variant: "default",
          })
        })
        .catch((shareError) => {
          console.error("Share failed:", shareError)
        toast({
          title: "Error",
          description: "Failed to share visiting card.",
          variant: "destructive",
          })
        })
    } else {
      // Fallback for browsers that don't support Web Share API
      // You could implement copy to clipboard or direct links to social media
      alert("Web Share API not supported in this browser. You can manually copy the card details.")
      toast({
        title: "Info",
        description: "Web Share API not supported in this browser. You can manually copy the card details.",
        variant: "default",
      })
    }
  }

  // Function to fetch team members
  const fetchTeamMembers = async () => {
    if (!user) return // Allow both agents and companies to fetch their downline
    
    setLoadingTeam(true)
    try {
      const response = await axios.get("http://localhost:5000/api/teams/my-downline", {
          headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      console.log("DEBUG - Profile - Team members fetched:", response.data)
      setTeamMembers(response.data.data.downline || [])
    } catch (err) {
      console.error("DEBUG - Profile - Error fetching team members:", err)
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      })
    } finally {
      setLoadingTeam(false)
    }
  }

  // Function to copy referral link
  const copyReferralLink = () => {
    const referralLink = `https://kaamupoot.com/join?ref=${user?.referralCode}`
    navigator.clipboard
      .writeText(referralLink)
      .then(() => {
      toast({
        title: "Success",
        description: "Referral link copied to clipboard!",
        variant: "default",
        })
      })
      .catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy referral link",
        variant: "destructive",
        })
      })
  }

  if (!user) {
    return null // Or a loading spinner/message
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="w-full bg-estate-green text-white py-4 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <UserRound className="mx-auto h-16 w-16 mb-2 rounded-full border-4 border-white shadow-lg" />
          <h1 className="text-3xl font-bold mb-2 animate-fade-in">
            Welcome, {user.firstName} {user.lastName}!
          </h1>
          <p className="text-md opacity-90 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Manage your profile and digital presence.
          </p>
        </div>
      </div>

      <main className="flex-1 page-container py-12 md:py-16 lg:py-20 -mt-10 z-10">
        <div className="w-full flex justify-center px-2 sm:px-4">
          <div className="w-full max-w-[900px] mx-auto">
          <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full mb-8 h-auto grid-cols-2 md:grid-cols-4 gap-1 [&>*]:flex-1">
                <TabsTrigger value="personal" className="text-center text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-3 truncate">
                  <span className="hidden sm:inline">Personal Info</span>
                  <span className="sm:hidden">Personal</span>
                </TabsTrigger>
                <TabsTrigger value="banking" className="text-center text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-3 truncate">
                  <span className="hidden sm:inline">Banking Details</span>
                  <span className="sm:hidden">Banking</span>
                </TabsTrigger>
                <TabsTrigger value="kyc" className="text-center text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-3 truncate">
                  <span className="hidden sm:inline">KYC Documents</span>
                  <span className="sm:hidden">KYC</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="text-center text-xs sm:text-sm px-1 sm:px-2 py-2 sm:py-3 truncate">
                  <span className="hidden sm:inline">My Team</span>
                  <span className="sm:hidden">Team</span>
                </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="min-w-full">
              <div className="min-h-[400px]">
                    <Card className="w-full shadow-xl rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-estate-green text-2xl">Personal Information</CardTitle>
                  <CardDescription>Update your basic contact details and personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalInfoUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                              <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="border-gray-300 focus:border-estate-green focus:ring-estate-green"
                              />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                              <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="border-gray-300 focus:border-estate-green focus:ring-estate-green"
                              />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="dateOfBirth" 
                            type="date" 
                            value={dateOfBirth} 
                            onChange={(e) => setDateOfBirth(e.target.value)} 
                            className="pl-10 border-gray-300 focus:border-estate-green focus:ring-estate-green" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Select value={gender} onValueChange={setGender}>
                            <SelectTrigger className="pl-10">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled
                                className="pl-10 bg-gray-100 cursor-not-allowed"
                              />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Primary Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="phone"
                                  type="tel"
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  className="pl-10 border-gray-300 focus:border-estate-green focus:ring-estate-green"
                                />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="alternatePhone">Alternate Phone</Label>
                        <div className="relative">
                          <PhoneForwarded className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="alternatePhone"
                                  type="tel"
                                  value={alternatePhone}
                                  onChange={(e) => setAlternatePhone(e.target.value)}
                                  className="pl-10 border-gray-300 focus:border-estate-green focus:ring-estate-green"
                                />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Home className="h-5 w-5 text-estate-green" />
                        Address Details
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="streetAddress">Street Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="streetAddress"
                              value={streetAddress}
                              onChange={(e) => setStreetAddress(e.target.value)}
                              placeholder="House/Flat number, Street name"
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="landmark">Landmark</Label>
                            <Input
                              id="landmark"
                              value={landmark}
                              onChange={(e) => setLandmark(e.target.value)}
                              placeholder="Nearby landmark"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="City name"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              placeholder="State name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode</Label>
                            <Input
                              id="pincode"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              placeholder="6-digit pincode"
                              maxLength={6}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="Country name"
                          />
                        </div>
                      </div>
                    </div>

                          {user?.userType === "company" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="companyName">Company Name</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="companyName"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="pl-10 border-gray-300 focus:border-estate-green focus:ring-estate-green"
                                  />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="pl-10 border-gray-300 focus:border-estate-green focus:ring-estate-green"
                                  />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="licenseNumber">License Number</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input
                                    id="licenseNumber"
                                    value={licenseNumber}
                                    onChange={(e) => setLicenseNumber(e.target.value)}
                                    className="pl-10 border-gray-300 focus:border-estate-green focus:ring-estate-green"
                                  />
                          </div>
                        </div>
                      </>
                    )}
                    <Button 
                      type="submit" 
                      className="w-full bg-estate-green hover:bg-estate-green/90 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                            disabled={isSubmitting === "personal"}
                    >
                            {isSubmitting === "personal" ? "Updating..." : "Update Personal Information"}
                    </Button>
                  </form>

                  {/* Visiting Card Section */}
                  <Card className="mt-10 p-6 shadow-lg rounded-lg border-2 border-estate-green bg-gradient-to-br from-estate-green/10 to-white">
                    <CardHeader className="pb-4">
                            <CardTitle className="text-estate-green text-2xl flex items-center gap-2">
                              <UserRound size={24} /> Your Digital Visiting Card
                            </CardTitle>
                            <CardDescription>
                              Generate and share your professional digital visiting card easily.
                            </CardDescription>
                    </CardHeader>
                          <CardContent className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
                            <div
                              id="visiting-card-content"
                              className="w-full lg:w-2/3 pb-2 sm:pb-3 bg-white rounded-lg shadow-md border border-gray-200 text-center relative overflow-hidden group hover:shadow-xl transition-shadow duration-300"
                            >
                        <div className="absolute inset-0 bg-gradient-to-br from-estate-green/5 to-estate-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <img
                                src="/kamaupoot logo.webp"
                                alt="Kamaupoot Logo"
                                className="mx-auto h-16 sm:h-20 lg:h-44  transition-transform duration-300 group-hover:scale-105"
                              />
                              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-estate-green mb-1">
                                {firstName} {lastName}
                              </h2>
                              <p className="text-base sm:text-lg lg:text-xl text-gray-700 font-medium mb-2 sm:mb-3">
                                {user?.userType === "agent" ? "Real Estate Agent" : companyName}
                              </p>
                              <div className="space-y-1 text-gray-600 mb-2 sm:mb-4 text-sm sm:text-base">
                                <p className="flex items-center justify-center gap-2">
                                  <Mail size={16} className="text-estate-green sm:w-[18px] sm:h-[18px]" />
                                  <span className="break-all">{email}</span>
                                </p>
                                <p className="flex items-center justify-center gap-2">
                                  <Phone size={16} className="text-estate-green sm:w-[18px] sm:h-[18px]" /> {phone}
                                </p>
                                {user?.userType === "company" && (
                                  <p className="flex items-center justify-center gap-2">
                                    <MapPin size={16} className="text-estate-green sm:w-[18px] sm:h-[18px]" />
                                    <span className="break-words">{address}</span>
                                  </p>
                          )}
                                {user?.userType === "admin" && (
                                  <p className="flex items-center justify-center gap-2">
                                    <User2 size={16} className="text-estate-green sm:w-[18px] sm:h-[18px]" /> Admin
                                  </p>
                          )}
                        </div>
                              <p className="text-xs sm:text-sm text-gray-500 italic">
                                "Your trusted partner in real estate."- (This is a placeholder for a custom tagline)
                              </p>
                      </div>
                            <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-1/3">
                              <Button
                                onClick={generateVisitingCard}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md text-sm sm:text-base"
                              >
                          Generate Card
                        </Button>
                              <Button
                                onClick={shareVisitingCard}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300 shadow-md text-sm sm:text-base"
                              >
                          Share Card
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
                  </div>
            </TabsContent>

            <TabsContent value="banking" className="min-w-full">
              <div className="min-h-[400px]">
                <Card className="w-full shadow-xl rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-estate-green text-2xl">Banking Details</CardTitle>
                  <CardDescription>Add your bank account information for secure transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBankingUpdate} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="holderName">Account Holder Name</Label>
                            <div className="relative">
                              <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="holderName"
                                value={holderName}
                                onChange={(e) => setHolderName(e.target.value)}
                                placeholder="e.g., John Doe"
                                className="pl-10"
                              />
                            </div>
                          </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <div className="relative">
                        <Banknote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="bankName"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="pl-10"
                        />
                          </div>
                      </div>
                    </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="accountNumber"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="pl-10"
                          type="password"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="ifscCode"
                        value={ifscCode}
                        onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                        placeholder="e.g., SBIN0001234"
                              className="pl-10"
                      />
                          </div>
                        </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-estate-green hover:bg-estate-green/90 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                            disabled={isSubmitting === "banking"}
                    >
                            {isSubmitting === "banking" ? "Updating..." : "Update Banking Details"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
                  </div>
            </TabsContent>

            <TabsContent value="kyc" className="min-w-full">
              <div className="min-h-[400px]">
                <Card className="w-full shadow-xl rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-estate-green text-2xl">KYC Documents</CardTitle>
                  <CardDescription>Upload your verification documents securely.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleKycUpdate} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        placeholder="e.g., ABCDE1234F"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aadharNumber">Aadhar Number</Label>
                      <Input
                        id="aadharNumber"
                        value={aadharNumber}
                        onChange={(e) => setAadharNumber(e.target.value)}
                        placeholder="12-digit Aadhar number"
                        maxLength={12}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* PAN Card Upload (keep only one) */}
                      <div className="space-y-2">
                        <Label>PAN Card</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                                ref={panCardRef}
                                onChange={(e) => handleFileChange(e, setPanCard)}
                                accept="image/*,.pdf"
                                id="panCard"
                          />
                          <Label
                            htmlFor="panCard"
                            className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </Label>
                        </div>
                          {panCard ? (
                            <p className="text-sm text-gray-500 mt-1 truncate">Selected: {panCard.name}</p>
                          ) : (
                            user?.documents?.panCard && (
                              <div className="text-sm text-green-700 mt-1 font-medium truncate">
                                <a
                                  href={`http://localhost:5000/uploads/${user.documents.panCard.split(/[\\\\/]/).pop()}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {user.documents.panCard.split(/[\\\\/]/).pop()}
                                </a>
                                <span> (Uploaded)</span>
                              </div>
                            )
                          )}
                      </div>

                      {/* Aadhar Card Front Upload */}
                      <div className="space-y-2">
                        <Label>Aadhar Card Front</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            onChange={(e) => handleFileChange(e, setAadharCardFront)}
                                accept="image/*,.pdf"
                                id="aadharCardFront"   
                          />
                          <Label
                            htmlFor="aadharCardFront"
                            className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </Label>
                        </div>
                          {aadharCardFront ? (
                            <p className="text-sm text-gray-500 mt-1 truncate">Selected: {aadharCardFront.name}</p>
                          ) : (
                            user?.documents?.aadharCardFront && (
                              <div className="text-sm text-green-700 mt-1 font-medium truncate">
                                <a
                                  href={`http://localhost:5000/uploads/${user.documents.aadharCardFront.split(/[\\\\/]/).pop()}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {user.documents.aadharCardFront.split(/[\\\\/]/).pop()}
                                </a>
                                <span> (Uploaded)</span>
                              </div>
                            )
                          )}
                      </div>

                      {/* Aadhar Card Back Upload */}
                      <div className="space-y-2">
                        <Label>Aadhar Card Back</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            onChange={(e) => handleFileChange(e, setAadharCardBack)}
                                accept="image/*,.pdf"
                            id="aadharCardBack"    
                          />
                          <Label
                            htmlFor="aadharCardBack"
                            className="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
                          >
                            <Upload className="h-4 w-4" />
                            Upload
                          </Label>
                        </div>
                          {aadharCardBack ? (
                            <p className="text-sm text-gray-500 mt-1 truncate">Selected: {aadharCardBack.name}</p>
                          ) : (
                            user?.documents?.aadharCardBack && (
                              <div className="text-sm text-green-700 mt-1 font-medium truncate">
                                <a
                                  href={`http://localhost:5000/uploads/${user.documents.aadharCardBack.split(/[\\\\/]/).pop()}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {user.documents.aadharCardBack.split(/[\\\\/]/).pop()}
                                </a>
                                <span> (Uploaded)</span>
                              </div>
                            )
                          )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-estate-green hover:bg-estate-green/90 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                            disabled={isSubmitting === "kyc"}
                    >
                            {isSubmitting === "kyc" ? "Updating..." : "Update KYC Documents"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
                  </div>
            </TabsContent>

            <TabsContent value="team" className="min-w-full">
              <div className="min-h-[400px]">
                <Card className="w-full shadow-xl rounded-lg border border-gray-200 bg-white/95 backdrop-blur-sm">
                <CardHeader>
                          <CardTitle className="text-estate-green text-2xl">My Team & Referrals</CardTitle>
                          <CardDescription>
                            Manage your referred team members and share your referral code.
                          </CardDescription>
                </CardHeader>
                        <CardContent className="space-y-6">
                        <div className="border p-3 sm:p-4 rounded-lg bg-blue-50/50 flex flex-col gap-3 sm:gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="referralCode"
                              className="text-base sm:text-lg font-semibold text-estate-blue"
                            >
                              Your Referral Code:
                            </Label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                      <Input
                                  id="referralCode"
                                value={user?.referralCode || "N/A"}
                                  readOnly
                                className="font-mono bg-blue-100 border-blue-200 text-blue-800 text-xs sm:text-base flex-1 min-w-0"
                                />
                              <Button
                                onClick={copyReferralLink}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap text-xs sm:text-sm px-2 sm:px-4"
                              >
                                  <Copy className="h-4 w-4 mr-2" /> Copy Link
                                </Button>
                    </div>
                            <p className="text-xs sm:text-sm text-blue-700">
                              Share this code with others to build your team!
                            </p>
                            </div>
                    </div>

                          <Separator />

                        <h3 className="text-lg sm:text-xl font-semibold mb-4">Your Downline Team Members</h3>
                          {loadingTeam ? (
                            <div className="flex justify-center items-center h-40">
                              <p>Loading team members...</p>
                        </div>
                          ) : teamMembers.length > 0 ? (
                          <>
                            {/* Table for sm and above */}
                            <div className="hidden sm:block overflow-x-auto w-full">
                              <Table className="min-w-[600px] w-full text-xs sm:text-sm">
                              <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[120px] px-2 sm:px-4">Name</TableHead>
                                    <TableHead className="min-w-[200px] px-2 sm:px-4">Email</TableHead>
                                    <TableHead className="min-w-[120px] px-2 sm:px-4">Phone</TableHead>
                                    <TableHead className="min-w-[120px] px-2 sm:px-4">Registered On</TableHead>
                                    <TableHead className="min-w-[100px] px-2 sm:px-4">User Type</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {teamMembers.map((member: any) => (
                                    <TableRow key={member._id} className="hover:bg-gray-50">
                                  <TableCell className="font-medium px-2 sm:px-4">
                                    {member.firstName} {member.lastName}
                                  </TableCell>
                                      <TableCell className="break-all px-2 sm:px-4">{member.email}</TableCell>
                                      <TableCell className="px-2 sm:px-4">{member.phone}</TableCell>
                                  <TableCell className="px-2 sm:px-4">
                                    {new Date(member.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell className="px-2 sm:px-4">
                                    <Badge variant="secondary" className="text-xs">
                                      {member.userType}
                                    </Badge>
                                  </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            </div>
                            {/* Card view for mobile */}
                            <div className="block sm:hidden space-y-4">
                              {teamMembers.map((member: any) => (
                            <div
                              key={member._id}
                              className="rounded-lg border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-2"
                            >
                              <div className="font-semibold text-base text-estate-green">
                                {member.firstName} {member.lastName}
                              </div>
                                  <div className="text-xs text-gray-700 break-all">{member.email}</div>
                                  <div className="text-xs text-gray-700">{member.phone}</div>
                              <div className="text-xs text-gray-500">
                                Registered: {new Date(member.createdAt).toLocaleDateString()}
                              </div>
                              <div>
                                <Badge variant="secondary" className="text-xs">
                                  {member.userType}
                                </Badge>
                              </div>
                                </div>
                              ))}
                            </div>
                          </>
                          ) : (
                            <div className="text-center py-10">
                              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-base sm:text-lg text-gray-600">No team members yet.</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">
                          Share your referral code to grow your team!
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
                      </div>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// Update error boundary with proper TypeScript types
interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ProfileErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Profile Error:", error, errorInfo)
  }

  public render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're sorry, but there was an error loading the profile page.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-estate-green text-white px-4 py-2 rounded hover:bg-estate-green/90 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Wrap the Profile component with error boundary
const ProfileWithErrorBoundary = () => (
  <ProfileErrorBoundary>
    <Profile />
  </ProfileErrorBoundary>
)

export default ProfileWithErrorBoundary
