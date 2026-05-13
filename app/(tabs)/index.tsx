import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

// ======================================================
// DompetKu - Aplikasi Pencatat Keuangan Sederhana
// UTS Project | Expense Tracker
// Tema: Biru
// ======================================================

export default function App() {
  // ---------- STATE ----------
  const [transaksi, setTransaksi] = useState([
    { id: '1', ket: 'Uang Saku Bulanan', nominal: 500000, tipe: 'masuk' },
    { id: '2', ket: 'Beli Cilok', nominal: 5000, tipe: 'keluar' },
    { id: '3', ket: 'Bayar Fotokopi', nominal: 15000, tipe: 'keluar' },
  ]);
  const [inputKet, setInputKet] = useState('');
  const [inputNominal, setInputNominal] = useState('');

  // ---------- LOGIKA HITUNG SALDO ----------
  const totalSaldo = transaksi.reduce((acc, t) => {
    return t.tipe === 'masuk' ? acc + t.nominal : acc - t.nominal;
  }, 0);

  const totalMasuk = transaksi
    .filter(t => t.tipe === 'masuk')
    .reduce((acc, t) => acc + t.nominal, 0);

  const totalKeluar = transaksi
    .filter(t => t.tipe === 'keluar')
    .reduce((acc, t) => acc + t.nominal, 0);

  // ---------- FORMAT RUPIAH ----------
  const formatRupiah = (nominal) => {
    return 'Rp ' + Math.abs(nominal).toLocaleString('id-ID');
  };

  // ---------- TAMBAH TRANSAKSI ----------
  const tambahTransaksi = (tipe) => {
    if (!inputKet.trim()) {
      Alert.alert('Oops!', 'Deskripsi transaksi tidak boleh kosong.');
      return;
    }
    const nominal = parseFloat(inputNominal);
    if (!nominal || nominal <= 0) {
      Alert.alert('Oops!', 'Nominal harus berupa angka lebih dari 0.');
      return;
    }

    const transaksiBarU = {
      id: Date.now().toString(),
      ket: inputKet.trim(),
      nominal: nominal,
      tipe: tipe, // 'masuk' atau 'keluar'
    };

    setTransaksi(prev => [transaksiBarU, ...prev]);
    setInputKet('');
    setInputNominal('');
  };

  // ---------- HAPUS TRANSAKSI ----------
  const hapusTransaksi = (id) => {
    Alert.alert(
      'Hapus Transaksi',
      'Yakin mau hapus transaksi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => setTransaksi(prev => prev.filter(t => t.id !== id)),
        },
      ]
    );
  };

  // ---------- RENDER TIAP ITEM TRANSAKSI ----------
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.trxItem}
      onLongPress={() => hapusTransaksi(item.id)}
      activeOpacity={0.7}
    >
      {/* Icon Tipe */}
      <View style={[
        styles.trxIcon,
        item.tipe === 'masuk' ? styles.iconMasuk : styles.iconKeluar
      ]}>
        <Text style={styles.trxIconText}>
          {item.tipe === 'masuk' ? '↑' : '↓'}
        </Text>
      </View>

      {/* Info Transaksi */}
      <View style={styles.trxInfo}>
        <Text style={styles.trxKet} numberOfLines={1}>{item.ket}</Text>
        <Text style={styles.trxTipe}>
          {item.tipe === 'masuk' ? '⬆ Pemasukan' : '⬇ Pengeluaran'}
        </Text>
      </View>

      {/* Nominal - WARNA HIJAU = masuk, MERAH = keluar */}
      <Text style={[
        styles.trxNominal,
        item.tipe === 'masuk' ? styles.nominalMasuk : styles.nominalKeluar
      ]}>
        {item.tipe === 'masuk' ? '+' : '-'}{formatRupiah(item.nominal)}
      </Text>
    </TouchableOpacity>
  );

  // ---------- KOMPONEN HEADER SALDO ----------
  const HeaderSaldo = () => (
    <View style={styles.headerCard}>
      <Text style={styles.saldoLabel}>💳 TOTAL SALDO</Text>
      <Text style={styles.saldoNominal}>
        {totalSaldo < 0 ? '-' : ''}{formatRupiah(totalSaldo)}
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>⬆ PEMASUKAN</Text>
          <Text style={styles.statVal}>{formatRupiah(totalMasuk)}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>⬇ PENGELUARAN</Text>
          <Text style={styles.statVal}>{formatRupiah(totalKeluar)}</Text>
        </View>
      </View>
    </View>
  );

  // ---------- KOMPONEN FORM INPUT ----------
  const FormInput = () => (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>✏️ TAMBAH TRANSAKSI</Text>

      <Text style={styles.inputLabel}>Deskripsi</Text>
      <TextInput
        style={styles.inputField}
        placeholder="Contoh: Beli Makan, Uang Saku..."
        placeholderTextColor="#93c5fd"
        value={inputKet}
        onChangeText={setInputKet}
      />

      <Text style={styles.inputLabel}>Nominal (Rp)</Text>
      <TextInput
        style={styles.inputField}
        placeholder="Contoh: 50000"
        placeholderTextColor="#93c5fd"
        value={inputNominal}
        onChangeText={setInputNominal}
        keyboardType="numeric"
      />

      <View style={styles.btnRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnMasuk]}
          onPress={() => tambahTransaksi('masuk')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>⬆ Pemasukan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnKeluar]}
          onPress={() => tambahTransaksi('keluar')}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>⬇ Pengeluaran</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ---------- KOMPONEN EMPTY STATE ----------
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🪙</Text>
      <Text style={styles.emptyText}>
        Belum ada transaksi.{'\n'}Yuk catat keuanganmu!
      </Text>
    </View>
  );

  // ---------- MAIN RENDER ----------
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor="#1d4ed8" barStyle="light-content" />

      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>💸 DompetKu</Text>
        <Text style={styles.appBarSub}>Pencatat Keuangan Kampus</Text>
      </View>

      <FlatList
        data={transaksi}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState />}
        ListHeaderComponent={
          <>
            <HeaderSaldo />
            <FormInput />
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>📋 RIWAYAT TRANSAKSI</Text>
              <View style={styles.historyBadge}>
                <Text style={styles.historyBadgeText}>
                  {transaksi.length} transaksi
                </Text>
              </View>
            </View>
            {transaksi.length > 0 && (
              <Text style={styles.swipeHint}>
                * Tekan & tahan untuk hapus transaksi
              </Text>
            )}
          </>
        }
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
}

// ======================================================
// STYLES - Tema Hijau Muda
// ======================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff6ff', // biru paling muda
  },

  // --- App Bar ---
  appBar: {
    backgroundColor: '#1d4ed8',
    paddingTop: Platform.OS === 'ios' ? 50 : 36,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  appBarTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  appBarSub: {
    fontSize: 12,
    color: '#bfdbfe',
    fontWeight: '600',
    marginTop: 2,
  },

  // --- List / Scroll ---
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // --- Header Saldo ---
  headerCard: {
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saldoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dcfce7',
    letterSpacing: 2,
    marginBottom: 6,
  },
  saldoNominal: {
    fontSize: 30,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 10,
  },
  statLabel: {
    fontSize: 10,
    color: '#dcfce7',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 3,
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },

  // --- Form ---
  formCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 5,
  },
  inputField: {
    width: '100%',
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#93c5fd',
    borderRadius: 12,
    fontSize: 14,
    color: '#1e3a8a',
    backgroundColor: '#f0f9ff',
    marginBottom: 12,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnMasuk: {
    backgroundColor: '#22c55e',
  },
  btnKeluar: {
    backgroundColor: '#ef4444',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },

  // --- Riwayat Header ---
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    marginTop: 4,
  },
  historyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1d4ed8',
    letterSpacing: 1.5,
  },
  historyBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  swipeHint: {
    fontSize: 10,
    color: '#93c5fd',
    fontStyle: 'italic',
    marginBottom: 10,
  },

  // --- Item Transaksi ---
  trxItem: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  trxIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconMasuk: {
    backgroundColor: '#dcfce7',
  },
  iconKeluar: {
    backgroundColor: '#fee2e2',
  },
  trxIconText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#374151',
  },
  trxInfo: {
    flex: 1,
  },
  trxKet: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  trxTipe: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  trxNominal: {
    fontSize: 15,
    fontWeight: '800',
  },
  // STYLING WAJIB: HIJAU = pemasukan, MERAH = pengeluaran
  nominalMasuk: {
    color: '#16a34a', // HIJAU untuk pemasukan
  },
  nominalKeluar: {
    color: '#ef4444', // MERAH untuk pengeluaran
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#93c5fd',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
});