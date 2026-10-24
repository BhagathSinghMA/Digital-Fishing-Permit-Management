import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import * as Print from 'expo-print';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useFocusEffect } from 'expo-router';
import { getLivePermit, LivePermitData } from '../services/api';

interface LivePermitProps {
  registrationNumber?: string;
  onApplyNewPermit?: () => void;
}

export default function LivePermit({ registrationNumber, onApplyNewPermit }: LivePermitProps) {
  const router = useRouter();
  const [liveData, setLiveData] = useState<LivePermitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Real-time 24-hour Countdown Timer State
  const [countdown, setCountdown] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
    totalSecondsRemaining: number;
  }>({
    hours: '24',
    minutes: '00',
    seconds: '00',
    isExpired: false,
    totalSecondsRemaining: 24 * 3600,
  });

  const fetchLivePermit = async () => {
    const data = await getLivePermit(registrationNumber);
    setLiveData(data);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchLivePermit();
  }, [registrationNumber]);

  useFocusEffect(
    useCallback(() => {
      fetchLivePermit();
    }, [registrationNumber])
  );

  // Auto-polling when status is PENDING to detect officer acceptance/rejection in real-time
  useEffect(() => {
    if (liveData?.status === 'PENDING') {
      const interval = setInterval(() => {
        getLivePermit(registrationNumber).then((data) => {
          if (data) {
            setLiveData(data);
          }
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [liveData?.status, registrationNumber]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLivePermit();
    setRefreshing(false);
  };

  const handleApplyAction = () => {
    if (onApplyNewPermit) {
      onApplyNewPermit();
    } else {
      router.push({
        pathname: '/AddCrewMember',
        params: {
          registrationNumber: liveData?.registrationNumber || registrationNumber || 'TN-09-MM-1234',
        },
      } as any);
    }
  };

  // Robust Date Parser
  const parseDateTime = (str?: string): Date | null => {
    if (!str) return null;
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed;

    try {
      const cleaned = str.replace(',', '');
      const directParsed = new Date(cleaned);
      if (!isNaN(directParsed.getTime())) return directParsed;
    } catch {
      // Fallback
    }

    try {
      const parts = str.split(' ');
      if (parts.length >= 3) {
        const day = parseInt(parts[0], 10);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames.indexOf(parts[1]);
        const year = parseInt(parts[2].replace(',', ''), 10);

        let hours = 0;
        let minutes = 0;

        if (parts.length >= 5) {
          const timeParts = parts[3].split(':');
          hours = parseInt(timeParts[0], 10);
          minutes = parseInt(timeParts[1], 10);
          const ampm = parts[4].toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }

        if (month !== -1 && !isNaN(day) && !isNaN(year)) {
          return new Date(year, month, day, hours, minutes);
        }
      }
    } catch {
      // Return null on failure
    }
    return null;
  };

  const fallbackExpiryRef = useRef<number | null>(null);

  // Live 1-Second Countdown Timer Engine
  useEffect(() => {
    const statusUpper = (liveData?.status || '').toUpperCase();
    const isActive = liveData?.hasActivePermit || statusUpper === 'APPROVED' || statusUpper === 'ACTIVE';
    if (!liveData || !isActive) {
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      let targetTime: number;

      const expiryObj = parseDateTime(liveData.expiryTime);
      if (expiryObj && !isNaN(expiryObj.getTime())) {
        targetTime = expiryObj.getTime();
      } else {
        const issuedObj = parseDateTime(liveData.issuedTime);
        if (issuedObj && !isNaN(issuedObj.getTime())) {
          targetTime = issuedObj.getTime() + 24 * 60 * 60 * 1000;
        } else {
          if (!fallbackExpiryRef.current) {
            fallbackExpiryRef.current = now + 24 * 60 * 60 * 1000;
          }
          targetTime = fallbackExpiryRef.current;
        }
      }

      const diff = targetTime - now;

      if (diff <= 0) {
        setCountdown({
          hours: '00',
          minutes: '00',
          seconds: '00',
          isExpired: true,
          totalSecondsRemaining: 0,
        });
      } else {
        const totalSecs = Math.floor(diff / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        setCountdown({
          hours: String(hrs).padStart(2, '0'),
          minutes: String(mins).padStart(2, '0'),
          seconds: String(secs).padStart(2, '0'),
          isExpired: false,
          totalSecondsRemaining: totalSecs,
        });
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [liveData]);

  // Mask Phone for privacy
  const maskPhone = (phone?: string) => {
    if (!phone || phone.length < 6) return phone || '';
    const start = phone.substring(0, 2);
    const end = phone.substring(phone.length - 2);
    const masked = '*'.repeat(Math.max(4, phone.length - 4));
    return `${start}${masked}${end}`;
  };

  // QR Code Payload
  const qrPayload = useMemo(() => {
    if (!liveData) return 'NO_PERMIT_DATA';
    return JSON.stringify({
      permitNumber: liveData.permitNumber,
      vesselReg: liveData.registrationNumber,
      boatName: liveData.boatName,
      owner: liveData.ownerName,
      status: liveData.status,
      issued: liveData.issuedTime,
      expires: liveData.expiryTime,
      crewCount: liveData.crewMembers?.length || 0,
      harbor: 'Rameswaram Coastal Post',
      dept: 'TN Fisheries Dept',
    });
  }, [liveData]);

  // Download Official PDF
  const handleDownloadPdf = async () => {
    if (!liveData) {
      Alert.alert('Error', 'Permit details are not available yet.');
      return;
    }

    try {
      setGeneratingPdf(true);

      const parsedIssued = parseDateTime(liveData.issuedTime);
      const permitDate = parsedIssued && !isNaN(parsedIssued.getTime())
        ? `${String(parsedIssued.getDate()).padStart(2, '0')}/${String(parsedIssued.getMonth() + 1).padStart(2, '0')}/${parsedIssued.getFullYear()}`
        : `${String(new Date().getDate()).padStart(2, '0')}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
      const tokenNo = liveData.permitNumber || 'TOKEN-001';
      const registrationNo = liveData.registrationNumber || 'IND/TN/10/MM/2538';
      const ownerName = liveData.ownerName || 'Registered Owner';
      const currentYear = parsedIssued && !isNaN(parsedIssued.getTime()) ? parsedIssued.getFullYear() : new Date().getFullYear();
      const academicYear = `${currentYear} - ${currentYear + 1}`;

      const crewList = liveData.crewMembers || [];
      const rowCount = Math.max(4, Math.ceil(crewList.length / 2));
      let rowsHtml = '';
      for (let i = 0; i < rowCount; i++) {
        const leftIndex = i;
        const rightIndex = i + rowCount;
        const leftMember = crewList[leftIndex];
        const rightMember = crewList[rightIndex];

        rowsHtml += `
          <tr>
            <td class="col-num">${leftIndex + 1}.</td>
            <td class="col-name">${leftMember ? leftMember.name : '&nbsp;'}</td>
            <td class="col-id">${leftMember ? (leftMember.fishermanId || leftMember.phoneNumber || '') : '&nbsp;'}</td>
            <td class="col-num">${rightIndex + 1}.</td>
            <td class="col-name">${rightMember ? rightMember.name : '&nbsp;'}</td>
            <td class="col-id">${rightMember ? (rightMember.fishermanId || rightMember.phoneNumber || '') : '&nbsp;'}</td>
          </tr>
        `;
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Daily Fishing Permit</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Times New Roman', Times, serif, 'Noto Sans Tamil', sans-serif; color: #111; }
            body { background: #fff; padding: 10px; }
            .permit-container { border: 2px solid #1a1a1a; padding: 24px 28px; background: #ffffff; border-radius: 4px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
            .header-logo-cell { width: 85px; vertical-align: top; }
            .header-logo { width: 76px; height: 76px; object-fit: contain; }
            .header-center-cell { vertical-align: middle; text-align: left; padding-left: 10px; }
            .header-tamil-title { font-size: 19px; font-weight: bold; margin-bottom: 3px; }
            .header-eng-title { font-size: 21px; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px; }
            .header-sub-tamil { font-size: 13px; font-weight: bold; margin-bottom: 2px; }
            .header-sub-eng { font-size: 13px; font-weight: 600; }
            .header-year-cell { width: 130px; vertical-align: top; text-align: right; font-size: 18px; font-weight: bold; }
            .meta-stamp-wrapper { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 10px; margin-bottom: 14px; position: relative; }
            .meta-table { width: 65%; border-collapse: collapse; font-size: 14px; }
            .meta-table td { padding: 4px 2px; vertical-align: baseline; }
            .meta-col-num { width: 24px; font-weight: bold; }
            .meta-col-label { width: 170px; font-weight: 600; }
            .meta-col-colon { width: 15px; font-weight: bold; }
            .meta-col-val { font-weight: bold; font-size: 15px; }
            .token-highlight { font-size: 22px; font-weight: 900; }
            .tamil-sub { font-size: 12px; display: block; color: #222; font-weight: normal; }
            .stamp-container { width: 160px; height: 160px; border: 3px solid #2e1d7a; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #2e1d7a; transform: rotate(-5deg); position: absolute; right: 15px; top: -10px; padding: 6px; }
            .stamp-inner-circle { width: 138px; height: 138px; border: 1px dashed #2e1d7a; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4px; }
            .stamp-dept { font-size: 9px; font-weight: 900; text-transform: uppercase; color: #2e1d7a; }
            .stamp-shift { font-size: 11px; font-weight: 900; border-top: 1.5px solid #2e1d7a; border-bottom: 1.5px solid #2e1d7a; padding: 2px 4px; margin: 4px 0; color: #2e1d7a; }
            .stamp-place { font-size: 8.5px; font-weight: 800; color: #2e1d7a; }
            .crew-table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 1.5px solid #111; }
            .crew-table th, .crew-table td { border: 1px solid #111; padding: 6px 8px; text-align: left; font-size: 13px; }
            .crew-table th { font-weight: bold; background: #fafafa; }
            .crew-table .col-num { width: 32px; text-align: center; font-weight: bold; }
            .crew-table .col-name { width: 28%; font-weight: 600; }
            .crew-table .col-id { width: 18%; font-weight: 600; }
            .footer-section { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 24px; }
            .diesel-text { font-size: 14px; font-weight: bold; }
            .signature-box { text-align: center; }
            .officer-seal-mark { font-family: 'Brush Script MT', cursive, sans-serif; font-size: 26px; color: #0d285b; font-style: italic; }
            .signature-line { font-size: 13px; font-weight: bold; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="permit-container">
            <table class="header-table">
              <tr>
                <td class="header-logo-cell">
                  <img class="header-logo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjJY7dzHiG81eFVKeZKUgOSRBZghVD_KOSUieN8JP56ePceAp3de3H1-MYilrJlEethAt1henHfD5vbE5xR3OE4T7FPpCZHU5GUoS5DM9Xll35CRFLXUZ5eT_E5VnQbYykbB43BtXukBWFp6V5G9bo_gSTlID_7PHykHW5VcwudNeapRyDTRX34K3oWX46urZm74O3JpKglCYVE-wwnp1St2BcslW9mnofnWErLwq16i8LHJX5r1ED" alt="Emblem" />
                </td>
                <td class="header-center-cell">
                  <div class="header-tamil-title">தினசரி மீன்பிடி அனுமதிச் சீட்டு</div>
                  <div class="header-eng-title">DAILY FISHING PERMIT</div>
                  <div class="header-sub-tamil">மீன்துறை உதவி இயக்குநர் (கடல்வளம்) இராமேஸ்வரம்.</div>
                  <div class="header-sub-eng">Office of the Assistant Director of Fisheries, Rameswaram.</div>
                </td>
                <td class="header-year-cell">${academicYear}</td>
              </tr>
            </table>

            <div class="meta-stamp-wrapper">
              <table class="meta-table">
                <tr><td class="meta-col-num">1</td><td class="meta-col-label"><span class="tamil-sub">நாள்</span>Date</td><td class="meta-col-colon">:</td><td class="meta-col-val">${permitDate}</td></tr>
                <tr><td class="meta-col-num">2</td><td class="meta-col-label"><span class="tamil-sub">டோக்கன் எண்</span>Token Number</td><td class="meta-col-colon">:</td><td class="meta-col-val token-highlight">${tokenNo}</td></tr>
                <tr><td class="meta-col-num">3</td><td class="meta-col-label"><span class="tamil-sub">படகு எண்</span>Registration No</td><td class="meta-col-colon">:</td><td class="meta-col-val">${registrationNo}</td></tr>
                <tr><td class="meta-col-num">4</td><td class="meta-col-label"><span class="tamil-sub">உரிமையாளரது பெயர்</span>Owner's Name</td><td class="meta-col-colon">:</td><td class="meta-col-val">${ownerName}</td></tr>
              </table>
              <div class="stamp-container">
                <div class="stamp-inner-circle">
                  <div class="stamp-dept">DIRECTOR OF FISHERIES</div>
                  <div class="stamp-shift">DAY &amp; NIGHT</div>
                  <div class="stamp-place">&#9733; RAMESWARAM &#9733;</div>
                </div>
              </div>
            </div>

            <table class="crew-table">
              <thead>
                <tr>
                  <th>5</th>
                  <th><div>குழுவில் உள்ள நபர்களின் பெயர்</div><div>No. of Crew</div></th>
                  <th><div>அடையாள அட்டைகளின் எண்</div><div>Identity card</div></th>
                  <th>#</th>
                  <th><div>குழுவில் உள்ள நபர்களின் பெயர்</div><div>No. of Crew</div></th>
                  <th><div>அடையாள அட்டைகளின் எண்</div><div>Identity card</div></th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>

            <div class="footer-section">
              <div class="diesel-text">டீசல் அளவு / Diesel Quantity: ____________</div>
              <div class="signature-box">
                <div class="officer-seal-mark">&sim;&sim; Verified &amp; Signed &sim;&sim;</div>
                <div class="signature-line">மீன்துறை ஆய்வாளருக்காக / For Inspector of Fisheries</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        await Print.printAsync({ html: htmlContent });
      }
    } catch {
      Alert.alert('PDF Error', 'Unable to generate PDF permit. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const status = (liveData?.status || 'NO_PERMIT').toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#005bb0']} />
        }
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconWrap}>
              <MaterialIcons name="verified-user" size={24} color="#005bb0" />
            </View>
            <View>
              <Text style={styles.title}>Daily Fishing Permit</Text>
              <Text style={styles.subtitle}>Official Coastal Departure Clearance</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.refreshBadge} onPress={onRefresh} activeOpacity={0.7}>
            <MaterialIcons name="refresh" size={16} color="#005bb0" />
            <Text style={styles.refreshText}>Sync</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005bb0" />
            <Text style={styles.loadingText}>Fetching latest permit clearance...</Text>
          </View>
        ) : status === 'PENDING' ? (
          /* ========================================================================= */
          /* 1. PENDING APPROVAL VIEW                                                  */
          /* ========================================================================= */
          <View style={styles.pendingCard}>
            <View style={styles.pendingPulseRow}>
              <View style={styles.pulseDot} />
              <Text style={styles.pulseText}>LIVE OFFICER VERIFICATION IN PROGRESS</Text>
            </View>

            <View style={styles.pendingIconCircle}>
              <MaterialIcons name="hourglass-top" size={44} color="#d97706" />
            </View>

            <Text style={styles.pendingTitle}>Waiting for Officer Approval</Text>
            <Text style={styles.tamilPendingTitle}>அதிகாரி அனுமதிக்காக காத்திருக்கிறது</Text>
            <Text style={styles.pendingDescription}>
              Your fishing permit application for vessel{' '}
              <Text style={styles.boldBlueText}>{liveData?.registrationNumber || registrationNumber}</Text>{' '}
              has been submitted. The Harbor Post Officer is verifying your biometric crew manifest.
            </Text>

            <View style={styles.pendingDetailsBox}>
              <View style={styles.pendingDetailRow}>
                <Text style={styles.pendingLabel}>Submitted At:</Text>
                <Text style={styles.pendingValue}>{liveData?.issuedTime || 'Today, Just now'}</Text>
              </View>
              <View style={styles.pendingDetailRow}>
                <Text style={styles.pendingLabel}>Vessel Name:</Text>
                <Text style={styles.pendingValue}>{liveData?.boatName || 'Sea King'}</Text>
              </View>
              <View style={styles.pendingDetailRow}>
                <Text style={styles.pendingLabel}>Crew Members:</Text>
                <Text style={styles.pendingValueHighlight}>
                  {liveData?.crewMembers?.length || 0} Fishermen Registered
                </Text>
              </View>
            </View>

            <View style={styles.autoRefreshNotice}>
              <ActivityIndicator size="small" color="#005bb0" />
              <Text style={styles.autoRefreshText}>
                Auto-syncing every 4 seconds. This screen will update automatically once approved.
              </Text>
            </View>
          </View>
        ) : status === 'REJECTED' ? (
          /* ========================================================================= */
          /* 2. REJECTED PERMIT VIEW (No 24h Block - User Can Apply Immediately)       */
          /* ========================================================================= */
          <View style={styles.rejectedCard}>
            <View style={styles.rejectedIconCircle}>
              <MaterialIcons name="cancel" size={46} color="#dc2626" />
            </View>

            <Text style={styles.rejectedTitle}>Permit Application Rejected</Text>
            <Text style={styles.tamilRejectedTitle}>அனுமதி விண்ணப்பம் நிராகரிக்கப்பட்டது</Text>

            {/* Rejection Reason Container */}
            <View style={styles.rejectionReasonCard}>
              <View style={styles.reasonHeader}>
                <MaterialIcons name="report-problem" size={18} color="#dc2626" />
                <Text style={styles.reasonHeaderTitle}>Officer Rejection Reason</Text>
              </View>
              <Text style={styles.reasonBodyText}>
                "{liveData?.rejectionReason || 'Crew manifest details could not be verified by the harbor station officer. Please review crew credentials and apply again.'}"
              </Text>
            </View>

            {/* Immediate Re-application Callout */}
            <View style={styles.reapplyInfoCard}>
              <MaterialIcons name="check-circle-outline" size={20} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text style={styles.reapplyInfoTitle}>No 24-Hour Restriction</Text>
                <Text style={styles.reapplyInfoDesc}>
                  You are eligible to submit a new permit application immediately with updated crew members.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyNowButton}
              onPress={handleApplyAction}
              activeOpacity={0.88}
            >
              <MaterialIcons name="add-circle" size={22} color="#ffffff" />
              <Text style={styles.applyNowButtonText}>+ Apply New Permit Now</Text>
            </TouchableOpacity>
          </View>
        ) : status === 'EXPIRED' || (status === 'APPROVED' && countdown.isExpired) ? (
          /* ========================================================================= */
          /* 3. EXPIRED PERMIT VIEW                                                    */
          /* ========================================================================= */
          <View style={styles.expiredCard}>
            <View style={styles.expiredIconCircle}>
              <MaterialIcons name="timer-off" size={44} color="#64748b" />
            </View>

            <Text style={styles.expiredTitle}>24-Hour Permit Expired</Text>
            <Text style={styles.tamilExpiredTitle}>அனுமதி காலம் முடிவடைந்தது</Text>
            <Text style={styles.expiredDesc}>
              Your previous voyage clearance for vessel{' '}
              <Text style={styles.boldBlueText}>{liveData?.registrationNumber || registrationNumber}</Text>{' '}
              has completed its 24-hour validity window.
            </Text>

            <View style={styles.expiredDetailsBox}>
              <View style={styles.expiredRow}>
                <Text style={styles.expiredLabel}>Permit Number:</Text>
                <Text style={styles.expiredValue}>{liveData?.permitNumber || 'TN-FP-EXPIRED'}</Text>
              </View>
              <View style={styles.expiredRow}>
                <Text style={styles.expiredLabel}>Expired At:</Text>
                <Text style={styles.expiredValue}>{liveData?.expiryTime || 'Today'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyNowButton}
              onPress={handleApplyAction}
              activeOpacity={0.88}
            >
              <MaterialIcons name="sailing" size={22} color="#ffffff" />
              <Text style={styles.applyNowButtonText}>+ Apply For Next 24h Permit</Text>
            </TouchableOpacity>
          </View>
        ) : !liveData || status === 'NO_PERMIT' ? (
          /* ========================================================================= */
          /* 4. NO PERMIT VIEW                                                         */
          /* ========================================================================= */
          <View style={styles.noPermitCard}>
            <View style={styles.noPermitIconCircle}>
              <MaterialIcons name="directions-boat" size={46} color="#005bb0" />
            </View>

            <Text style={styles.noPermitTitle}>No Active Fishing Permit</Text>
            <Text style={styles.tamilNoPermitTitle}>செயலில் உள்ள அனுமதி இல்லை</Text>
            <Text style={styles.noPermitDesc}>
              No voyage clearance is currently active for vessel{' '}
              <Text style={styles.boldBlueText}>{registrationNumber}</Text>. Add crew members to submit an application.
            </Text>

            <TouchableOpacity
              style={styles.applyNowButton}
              onPress={handleApplyAction}
              activeOpacity={0.88}
            >
              <MaterialIcons name="add-circle" size={22} color="#ffffff" />
              <Text style={styles.applyNowButtonText}>+ Apply For Permit</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ========================================================================= */
          /* 5. APPROVED & ACTIVE 24-HOUR PERMIT PASS VIEW                             */
          /* ========================================================================= */
          <>
            {/* 24-Hour Countdown Clock Banner */}
            <View style={styles.countdownBanner}>
              <View style={styles.timerHeaderRow}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveGreenDot} />
                  <Text style={styles.liveIndicatorText}>ACTIVE 24-HOUR PERMIT</Text>
                </View>
                <Text style={styles.timerSubtitle}>Time Remaining Before Expiry</Text>
              </View>

              {/* Digital LED Clock Boxes */}
              <View style={styles.clockContainer}>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeNumber}>{countdown.hours}</Text>
                  <Text style={styles.timeLabel}>HOURS</Text>
                </View>
                <Text style={styles.clockColon}>:</Text>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeNumber}>{countdown.minutes}</Text>
                  <Text style={styles.timeLabel}>MINUTES</Text>
                </View>
                <Text style={styles.clockColon}>:</Text>
                <View style={styles.timeBlock}>
                  <Text style={styles.timeNumber}>{countdown.seconds}</Text>
                  <Text style={styles.timeLabel}>SECONDS</Text>
                </View>
              </View>

              {/* Dynamic Expiry Progress Bar */}
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, Math.max(2, (countdown.totalSecondsRemaining / (24 * 3600)) * 100))}%` },
                  ]}
                />
              </View>
              <Text style={styles.expiryNote}>Expires: {liveData?.expiryTime || '24h from approval'}</Text>
            </View>

            {/* Official Security Pass Card (mParivahan / DigiLocker Style) */}
            <View style={styles.passContainer}>
              <View style={styles.passInner}>
                {/* Official Header */}
                <View style={styles.passHeaderRow}>
                  <View style={styles.passTitleContainer}>
                    <Text style={styles.passMainTitle}>DAILY FISHING PERMIT</Text>
                    <Text style={styles.passTamilTitle}>தினசரி மீன்பிடி அனுமதிச் சீட்டு</Text>
                  </View>

                  {/* Circular Department Authority Stamp */}
                  <View style={styles.officialStampBadge}>
                    <Text style={styles.stampDept}>TN FISHERIES</Text>
                    <MaterialIcons name="verified" size={14} color="#16a34a" />
                    <Text style={styles.stampApproved}>APPROVED</Text>
                  </View>
                </View>

                {/* Scannable QR Code Section */}
                <View style={styles.qrSection}>
                  <View style={styles.qrWrapper}>
                    <QRCode
                      value={qrPayload}
                      size={150}
                      color="#0f172a"
                      backgroundColor="#ffffff"
                    />
                  </View>
                  <View style={styles.qrVerifiedBadge}>
                    <MaterialIcons name="security" size={14} color="#005bb0" />
                    <Text style={styles.qrVerifiedText}>OFFICIAL SCANNABLE QR PASS</Text>
                  </View>
                </View>

                {/* Permit Info Grid */}
                <View style={styles.passDetailsGrid}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>PERMIT NUMBER</Text>
                      <Text style={styles.detailHighlight}>{liveData?.permitNumber || 'TN-FP-2026-00435'}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>BOAT REGISTRATION</Text>
                      <Text style={styles.detailHighlight}>{liveData?.registrationNumber || registrationNumber}</Text>
                    </View>
                  </View>

                  <View style={styles.gridDivider} />

                  <View style={styles.detailRow}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>BOAT NAME</Text>
                      <Text style={styles.detailValue}>{liveData?.boatName || 'Sea King'}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>REGISTERED OWNER</Text>
                      <Text style={styles.detailValue}>{liveData?.ownerName || 'Ramesh'}</Text>
                    </View>
                  </View>

                  <View style={styles.gridDivider} />

                  <View style={styles.detailRow}>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>ISSUED DATE & TIME</Text>
                      <Text style={styles.detailValue}>{liveData?.issuedTime || 'Today, 06:00 AM'}</Text>
                    </View>
                    <View style={styles.detailCol}>
                      <Text style={styles.detailLabel}>PERMIT STATUS</Text>
                      <View style={styles.statusBadgeInline}>
                        <View style={[styles.statusDot, { backgroundColor: '#16a34a' }]} />
                        <Text style={[styles.statusBadgeText, { color: '#16a34a' }]}>APPROVED</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Download PDF Button */}
                <TouchableOpacity
                  style={[styles.downloadPassBtn, generatingPdf && { opacity: 0.7 }]}
                  onPress={handleDownloadPdf}
                  activeOpacity={0.85}
                  disabled={generatingPdf}
                >
                  {generatingPdf ? (
                    <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 8 }} />
                  ) : (
                    <MaterialCommunityIcons name="file-pdf-box" size={22} color="#ffffff" />
                  )}
                  <Text style={styles.downloadPassBtnText}>
                    {generatingPdf ? 'Generating Official Permit PDF...' : 'Download Official Permit Pass (PDF)'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Crew Manifest Section */}
            <View style={styles.crewManifestSection}>
              <View style={styles.crewSectionHeader}>
                <View style={styles.crewSectionTitleWrap}>
                  <MaterialIcons name="groups" size={22} color="#005bb0" />
                  <Text style={styles.crewSectionTitle}>Crew Member Manifest</Text>
                </View>
                <View style={styles.crewCountPill}>
                  <Text style={styles.crewCountPillText}>
                    {liveData?.crewMembers?.length || 0} {liveData?.crewMembers?.length === 1 ? 'Fisherman' : 'Fishermen'}
                  </Text>
                </View>
              </View>

              <View style={styles.crewCardList}>
                {liveData?.crewMembers && liveData.crewMembers.length > 0 ? (
                  liveData.crewMembers.map((member, index) => (
                    <View
                      key={member.fishermanId + index}
                      style={[
                        styles.crewMemberCard,
                        index === (liveData.crewMembers?.length ?? 0) - 1 && styles.crewMemberCardLast,
                      ]}
                    >
                      <View style={styles.crewAvatarCircle}>
                        <FontAwesome5 name="user-alt" size={15} color="#005bb0" />
                      </View>
                      <View style={styles.crewInfoContainer}>
                        <View style={styles.crewNameRow}>
                          <Text style={styles.crewMemberName}>{member.name}</Text>
                          <View style={styles.verifiedCheckBadge}>
                            <MaterialIcons name="check-circle" size={16} color="#16a34a" />
                            <Text style={styles.verifiedBadgeText}>Verified</Text>
                          </View>
                        </View>
                        <View style={styles.crewMetaRow}>
                          <View style={styles.idChip}>
                            <MaterialIcons name="badge" size={13} color="#475569" />
                            <Text style={styles.idChipText}>{member.fishermanId}</Text>
                          </View>
                          {member.phoneNumber ? (
                            <View style={styles.phoneChip}>
                              <MaterialIcons name="phone" size={12} color="#64748b" />
                              <Text style={styles.phoneChipText}>{maskPhone(member.phoneNumber)}</Text>
                            </View>
                          ) : (
                            <View style={styles.roleChip}>
                              <Text style={styles.roleChipText}>Crew #{index + 1}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noCrewBox}>
                    <MaterialIcons name="person-outline" size={32} color="#94a3b8" />
                    <Text style={styles.noCrewText}>No crew members attached to this permit.</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f9fc',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
    maxWidth: 540,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  refreshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 4,
  },
  refreshText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#005bb0',
  },
  loadingContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },

  // 1. Pending View Styles
  pendingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fde68a',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  pendingPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d97706',
  },
  pulseText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.4,
  },
  pendingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  pendingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  tamilPendingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    textAlign: 'center',
  },
  pendingDescription: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    paddingHorizontal: 10,
  },
  boldBlueText: {
    color: '#005bb0',
    fontWeight: '800',
  },
  pendingDetailsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    gap: 8,
  },
  pendingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pendingLabel: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '600',
  },
  pendingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  pendingValueHighlight: {
    fontSize: 13,
    fontWeight: '800',
    color: '#005bb0',
  },
  autoRefreshNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  autoRefreshText: {
    flex: 1,
    fontSize: 11.5,
    color: '#64748b',
    lineHeight: 16,
  },

  // 2. Rejected View Styles
  rejectedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  rejectedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  rejectedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#991b1b',
    textAlign: 'center',
    marginBottom: 2,
  },
  tamilRejectedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7f1d1d',
    marginBottom: 16,
    textAlign: 'center',
  },
  rejectionReasonCard: {
    width: '100%',
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    marginBottom: 16,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  reasonHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991b1b',
    textTransform: 'uppercase',
  },
  reasonBodyText: {
    fontSize: 13.5,
    color: '#7f1d1d',
    fontWeight: '600',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  reapplyInfoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    marginBottom: 20,
    gap: 10,
  },
  reapplyInfoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 2,
  },
  reapplyInfoDesc: {
    fontSize: 12,
    color: '#15803d',
    lineHeight: 16,
  },
  applyNowButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#005bb0',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  applyNowButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },

  // 3. Expired View Styles
  expiredCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginTop: 10,
  },
  expiredIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  expiredTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#334155',
    textAlign: 'center',
    marginBottom: 2,
  },
  tamilExpiredTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 10,
    textAlign: 'center',
  },
  expiredDesc: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  expiredDetailsBox: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    gap: 8,
  },
  expiredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiredLabel: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '600',
  },
  expiredValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },

  // 4. No Permit View Styles
  noPermitCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#dbeafe',
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginTop: 10,
  },
  noPermitIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  noPermitTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 2,
  },
  tamilNoPermitTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    textAlign: 'center',
  },
  noPermitDesc: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  // 5. Approved Live Permit Pass & Countdown Styles
  countdownBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  timerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  liveIndicatorText: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#4ade80',
    letterSpacing: 0.5,
  },
  timerSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  timeBlock: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  clockColon: {
    fontSize: 26,
    fontWeight: '900',
    color: '#64748b',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 3,
  },
  expiryNote: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },

  // Security Pass Card
  passContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    overflow: 'hidden',
  },
  passInner: {
    padding: 20,
  },
  passHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  passTitleContainer: {
    flex: 1,
  },
  passMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#005bb0',
    letterSpacing: 0.5,
  },
  passTamilTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748b',
  },
  officialStampBadge: {
    borderWidth: 1.5,
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampDept: {
    fontSize: 8,
    fontWeight: '900',
    color: '#166534',
  },
  stampApproved: {
    fontSize: 8,
    fontWeight: '900',
    color: '#16a34a',
    marginTop: 1,
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  qrWrapper: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 10,
  },
  qrVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qrVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#005bb0',
    letterSpacing: 0.5,
  },
  passDetailsGrid: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailHighlight: {
    fontSize: 14,
    fontWeight: '900',
    color: '#005bb0',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  statusBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  gridDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 10,
  },
  downloadPassBtn: {
    backgroundColor: '#005bb0',
    borderRadius: 16,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#005bb0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  downloadPassBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },

  // Crew Manifest Section
  crewManifestSection: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  crewSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  crewSectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crewSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  crewCountPill: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d0e1fd',
  },
  crewCountPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#005bb0',
  },
  crewCardList: {
    gap: 10,
  },
  crewMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  crewMemberCardLast: {
    marginBottom: 0,
  },
  crewAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crewInfoContainer: {
    flex: 1,
  },
  crewNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  crewMemberName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  verifiedCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16a34a',
  },
  crewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  idChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#005bb0',
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  phoneChipText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  roleChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  noCrewBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  noCrewText: {
    fontSize: 13,
    color: '#64748b',
  },
});
