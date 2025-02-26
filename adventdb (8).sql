-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 13, 2024 at 08:08 AM
-- Server version: 8.0.33
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `adventdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth`
--

CREATE TABLE `auth` (
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `auth`
--

INSERT INTO `auth` (`username`, `password`) VALUES
('admin', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `data`
--

CREATE TABLE `data` (
  `Codeno` varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Location` varchar(100) NOT NULL,
  `Width` varchar(100) NOT NULL,
  `Height` varchar(100) NOT NULL,
  `Type` varchar(100) NOT NULL,
  `Media` varchar(100) NOT NULL,
  `Longitude` varchar(100) NOT NULL,
  `Latitude` varchar(100) NOT NULL,
  `display` varchar(100) NOT NULL,
  `client` varchar(200) NOT NULL,
  `Sday` date NOT NULL,
  `Eday` date NOT NULL,
  `Landmark` varchar(100) NOT NULL,
  `image` varchar(1000) NOT NULL,
  `id` int NOT NULL,
  `company` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `data`
--

INSERT INTO `data` (`Codeno`, `Location`, `Width`, `Height`, `Type`, `Media`, `Longitude`, `Latitude`, `display`, `client`, `Sday`, `Eday`, `Landmark`, `image`, `id`, `company`) VALUES
('1', 'Railway station road ', '400', '30', 'Flit', 'hoarding ', '16° 45\' 12.4776', '77° 59\' 48.1956', 'vacant', 'vacant', '2023-12-23', '2023-12-23', 'Near Telugutalli flyover', '1704277191149-railway station 40x30 l.JPG', 19, 'Advent'),
('2', 'Railway station road ', '40', '30', 'Flit', 'hoarding', '16° 45\' 12.4776', '77° 59\' 48.1956', 'Asianpaints ', 'moms', '2023-12-25', '2024-01-07', 'Near telugutally flyvoer', '1704277373121-railway station 40x30 l1.jpg', 20, 'Advent'),
('3', 'Opp Vuda park, Facing park hotel', '40', '40', 'Flit', 'hoarding ', '17.7241 ', '83.3395', 'MK Builders ', 'MK Builders ', '2023-12-30', '2024-03-31', 'Opp park hotel', '1704277618007-vudapark 40x40 l.jpg', 21, 'Advent'),
('4', 'Siripuram Dronam Raju Circe', '40', '40', 'F lit ', 'Hoarding', '18.3663', '83.7562', 'south india', 'RS Brothers', '2023-12-31', '2024-03-30', 'Dronam raju circle', '1704277811727-siripuram 40x40.jpg', 22, 'Advent'),
('5', 'Siripuram Dronam Raju Circe', '35', '30', 'F lit', 'hoarding', '18.3663', '83.7562', 'Kirtilal', 'Kirtilal', '2023-12-29', '2024-03-28', 'dronam raju circle', '1704277917363-siripuram 35x30 l.jpg', 23, 'Advent'),
('6', 'Siripuram C R Reddy Statue', '40', '30', 'F lit', 'hoarding ', '18.3663', '83.7562', 'Vilasam', 'Weltbite', '2023-12-31', '2024-03-30', 'CR Reddy Statue', '1704278093848-siripuram 40x30 l.jpg', 24, 'Advent'),
('7', 'On top of Vuda Building Siripuram', '40', '25', 'F lit', 'hoarding ', '17.7077', '83.2676', 'pulsus', 'Omics International', '2024-01-04', '2024-02-03', 'on top vuda compelx', '1704278279072-siripuram 40x25 l1.jpg', 25, 'Advent'),
('8', 'VIP Road', '30', '30', 'F lit', 'hoarding ', '17° 43\' 42.0204', '83° 18\' 51.336', 'Ambaty', 'Ambaty', '2023-12-31', '2024-03-30', 'opp masjid', '1704278411211-opp.spencers 30x30 l.jpg', 26, 'Advent'),
('9', 'VIP Road', '25', '25', 'Flit', 'hoarding ', '17° 43\' 42.0204\"', '83° 18\' 51.336', 'newply', 'Coral Media', '2023-12-15', '2024-01-14', 'opp Spencers Masjid', '1704278669089-opp.spencers 25x25 l.JPG', 27, 'Advent'),
('10', 'Jail road', '20', '30', 'Flit', 'cmr', '17° 43\' 10.2216', '83° 18\' 23.1444', 'CMR', 'CMR', '2023-12-31', '2024-03-30', 'old jail road', '1704278905768-jail road 20x30 l.jpg', 28, 'Advent'),
('11', 'Dwarakanagar', '40', '25', 'F lit', 'hoarding ', '17.7281881', '83.3081052', 'pulsus', 'Omics International', '2024-01-03', '2024-02-02', 'dwarakanagar', '1704279029613-dwarakanagar 40x25 F lit.JPG', 29, 'Advent'),
('12', 'Beach Road', '35', '40', 'Flit', 'hoarding ', '17.7722', '83.373', 'Jos Alukas', 'Zero Degree', '2023-12-31', '2024-03-30', 'Opp Submarine', '1704279264819-beach road 35x40 l.jpg', 30, 'Advent'),
('13', 'Vuda park', '30', '30', 'F lit', 'hoarding ', '17.7241', '83.3395', 'Vaisakhi', 'Vaisakhi', '2023-12-31', '2024-03-30', 'vudapark', '1704281057616-vudapark 30x30 l.jpg', 31, 'Advent'),
('14', 'MVP Colony Inside Rythu Bazaar', '30', '30', 'F lit', 'Hoardng', '83.33559', '17.74149', 'Malbar Gold', 'Splendour Gold', '2024-01-01', '2024-03-31', 'inside rythu bazaar', '1704342946463-mvp 30x30 l.jpg', 35, 'Advent'),
('15', 'MVP Colony Inside Rythu Bazaar', '30', '30', 'Flit', 'Hoarding', '83.33559', '17.74149', 'Vaibhav', 'Manoj Vaibhav', '2024-01-01', '2024-03-31', 'inside mvp rythu bazaar', '1704343168190-mvp 30x30 l.jpg', 36, 'Advent'),
('16', 'MVP Colony Inside Rythu Bazaar', '30', '30', 'F lit', 'hoarding ', '83.33559', '17.74149', 'Jos Alukas', 'Zero Degree', '2024-01-01', '2024-03-31', 'inside rythu bazaar', '1704343540038-mvp 30x30 l.jpg', 37, 'Advent'),
('17', 'MVP Colony Inside Rythu Bazaar', '20', '20', 'N lit', 'hoarding ', '83.33559', '17.74149', 'Gemini', 'Go Rorar', '2023-12-16', '2024-06-15', 'inside rythu bazaar', '1704343722230-mvp 20x20 l.jpg', 38, 'Advent'),
('18', 'MVP Colony Inside Rythu Bazaar', '30', '25', 'N lit', 'hoarding ', '83.33559', '17.74149', 'Vacant', 'vacant', '2024-01-04', '2024-01-04', 'inside rythu bazaar', '1704343870202-mvp 30x25 Non lit.jpg', 39, 'Advent'),
('19', 'MVP Colony Inside Rythu Bazaar', '40', '10', 'N lit', 'hoarding ', '83.33559', '17.74149', 'Vacant', 'Vacant', '2024-01-01', '2024-01-01', 'inside rythu bazaar', '1704344024335-mvp 40x10 l.jpg', 40, 'Advent'),
('20', 'MVP Colony Inside Rythu Bazaar', '40', '15', 'N lit', 'hoarding ', '83.33559', '17.74149', 'Gadiraju', 'Gadiraju', '2024-01-01', '2024-03-31', 'mvp rythu bazaar', '1704344214980-mvp rythubazar 40x15 l.jpg', 41, 'Advent'),
('21', 'MVP Colony Inside Rythu Bazaar', '20', '20', 'N lit', 'hoarding ', '83.33559', '17.74149', 'SVN bay park', 'SVN ', '2024-01-04', '2024-04-03', 'mvp rythu bazaar', '1704344346199-mvp rythubazar 20x20 nonlit.jpg', 42, 'Advent'),
('22', 'railway station road', '100', '100', 'xssss', 'hoarding', '11111', '22222', 'w3333', 'c8807000', '2024-01-07', '2024-01-16', 'hhuhh123456789', '1704724736433-WhatsApp Image 2024-01-02 at 12.25.53_912ce5fc.jpg', 43, 'Advent');

-- --------------------------------------------------------

--
-- Table structure for table `email`
--

CREATE TABLE `email` (
  `email` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `email`
--

INSERT INTO `email` (`email`) VALUES
('karthikchandra8189@gmail.com'),
('nagarajuaakash.20.cse@anits.edu.in'),
('adventoutdoor@gmail.com'),
('satishkaki1972@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `username` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`username`, `password`) VALUES
('emp1', 'emp1'),
('tirumal', 'tirumal');

-- --------------------------------------------------------

--
-- Table structure for table `landlord`
--

CREATE TABLE `landlord` (
  `Codeno` varchar(10000) NOT NULL,
  `Location` varchar(100) NOT NULL,
  `Width` varchar(100) NOT NULL,
  `Height` varchar(100) NOT NULL,
  `Type` varchar(100) NOT NULL,
  `LandLord_Name` varchar(100) NOT NULL,
  `Sday` date NOT NULL,
  `Eday` date NOT NULL,
  `Ramount` varchar(100) NOT NULL,
  `MCVtax` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `landlord`
--

INSERT INTO `landlord` (`Codeno`, `Location`, `Width`, `Height`, `Type`, `LandLord_Name`, `Sday`, `Eday`, `Ramount`, `MCVtax`) VALUES
('1', 'railway station road', '40', '30', 'Flit', 'Saraswati Devi', '2023-03-30', '2024-03-29', '220000', '260000'),
('2', 'Defence Flats', '40', '40', 'Flit', 'Secretary of Defence Flats owners Association', '2023-09-01', '2024-08-31', '200000', '300000'),
('3', 'Anits', '200', '200', 'D-Fit', 'Anits', '2023-01-01', '2023-12-14', '200000', '200000'),
('4', 'Anits CSE', '200', '200', 'D-Fit', 'Anits CSE', '2023-01-02', '2023-12-01', '20000', '20000');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `data`
--
ALTER TABLE `data`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `data`
--
ALTER TABLE `data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
