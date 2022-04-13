---
id: release-notes
title: Release Notes
sidebar_label: Release Notes
---


## IOMesh 0.11.0

### What's New

#### New Features

##### Installation and Deployment
* Support deployment of the IOMesh cluster in the all-flash mode.
* Support deployment of the IOMesh cluster using the offline installation package.

##### Storage Capability
Support access to storage services using the iSCSI protocol on the compute platforms affiliated with IOMesh outside the Kubernetes cluster. 

##### Maintenance and Management
* Implement the NodeGetVolumeStas interface in CSI Spec and support PV monitoring with integrated systems such as Prometheus.
* Support checking the connection status of Chunk services.


#### Improved Features
* Reserve CPU and memory resources for IOMesh Operator, NDM, and Zookeeper Operator to ensure the QoS of their pods.
* Provide Webhook to avoid unexpected parameter changes of clusters.
* Simplify IOMesh installation by improving the IOMesh deployment script.
* Optimize the license renewal method to update the license using the Kubernetes API. 
* Optimize the replication policy with only replication factor two or three is supported.
* Optimize the process of ZBS version upgrade.
* Optimize the Liveness/Readyness configuration of IOMesh pods to avoid repeated restarts of IOMesh pods due to high system load.


#### Resolved Issues
The issues listed below are resolved in this release.  
* NDM 1.7.x creates partitions for the disk by default when the WWID is not identified, causing the disk to be not mounted as cacheWithJournal or dataStoreWithJournal.
* The disk cannot be mounted when installing IOMesh Operator in the OpenShift Container Platform.
* The IOMesh system crashes because the loop device has been mounted by NDM.
* Probe cannot access the process name and causes a CrashLoop, as the process name has been modified.
* Memory leaks because Probe does not reclaim RPC connections.
* Memory leaks due to ZBS Client not being closed.
* The newly created pods bound to PVCs time out when the number of pods bound to PVCs on a Kubernetes worker node exceeds 100.
* A timeout occurs when formatting a PV as an XFS file system, as the capacity of PV exceeds 5TB.
* The disk cannot be mounted while device manager logs show messages of successful mounting.

#### Known Issues 
* Replicas of PVs by CSI volume cloning may not match with original PVs.
* The number of PVs per session cannot exceed 100,000.

### Specifications
Component
Version
iomesh-operator
0.11.0
csi-driver
2.4.0
zbs
5.2.0
zookeeper
3.5.9
node-disk-manager
1.8.0
hostpath-provisioner
0.5.2

### Compatibility

IOMesh supports servers running on Intel x86_64 and AMD x86_64 architectures.

IOMesh Compatibility 

Software/OS
Compatible Version
Kubernetes
Kubernetes v1.17~v1.21
OpenShift v3.11~v4.8
Linux OS
CentOS 7
CentOS 8
CoreOS
RHEL 7
RHEL 8

### Download Links
IOMesh Offline Installation Package
* Download Links:
https://cm.smartx.com/share?code=e2cc01ef-95cb-4e60-a745-b88365488636
* MD5: 25facf99281705129a9920bb899e43d2 



