---
id: basic-concepts
title: Basic Concepts
sidebar_label: Basic Concepts
---

Before deploying and using IOMesh, familiarity with the following concepts is suggested.

[**Kubernetes**](https://kubernetes.io/)

A portable, extensible open source container orchestration platform for managing containerized workloads and services, facilitating both declarative configuration and automation.

**Worker Node**

A worker machine that runs Kubernetes node components and containerized applications. IOMesh is installed, deployed, and running on the worker node. 

[**kubectl**](https://kubernetes.io/docs/reference/kubectl/)

A command line tool for communicating with the control plane of a Kubernetes cluster through the Kubernetes API.

**Stateful Application**

Applications can be stateful or stateless. Stateful applications store data on persistent disk storage for use by the server, client, and other applications. Stateless applications do not store client data on the server when switching sessions.

**IOMesh Block Storage**

IOMesh block storage service for ensuring distributed system consistency and data coherence, managing metadata and local disks, and implementing I/O redirection and high availability.

**IOMesh CSI Driver**

The self-developed [CSI](https://github.com/kubernetes-csi) driver that adheres to the CSI standard and utilizes RPC (Remote Procedure Call)  to manage persistent volumes, delivering reliable and consistent storage for data applications on Kubernetes. Each Kubernetes persistent volume corresponds to an iSCSI LUN in the IOMesh cluster.

**IOMesh Operator**

The IOMesh automated operations and maintenance component, allowing for roll updating IOMesh, scaling up or down nodes, and GitOps while being responsible for automatic discovery, allocation, and management of block devices.

**Chunk**

chunk 是每个存储节点内提供存储服务的模块.

[**Namespace**](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)

Provides a mechanism for dividing resources in the same cluster into isolated groups that can be created on demand and managed separately within a cluster.

[**StorageClass**](https://kubernetes.io/docs/concepts/storage/storage-classes/)

Provides a way for administrators to describe the classes of storage they offer or a template for dynamically provisioning persistent volumes and allows administrators to specify different attributes belonging to a storageclass.

[**Persistent Volume**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

A piece of storage in the cluster, which can be pre-provisioned by the administrator or dynamically provisioned using StorageClass. Persistent volumes, like other types of volumes, are implemented using volume plugins, but they have a lifecycle independent of any pod using PV. 

[**Persistent Volume Claim**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/)

A request for storage by a user. Conceptually similar to a pod, a pod consumes node resources while a PVC consumes PV resources; a pod can request a specific amount of resources like CPU and memory, and similarly a PVC can request a specific size of storage and access mode.

[**Volume Snapshot**](https://kubernetes.io/docs/concepts/storage/volume-snapshots/)

A user request for a snapshot of a volume, which is similar to a persistent volume request.

[**Volume Snapshot Class**](https://kubernetes.io/docs/concepts/storage/volume-snapshot-classes/)

Provides a way to describe the classes of storage when provisioning a volume snapshot. It allows you to specify different attributes belonging to a VolumeSnapshot. These attributes may differ among snapshots taken from the same volume on the storage system and therefore cannot be expressed by using the same StorageClass of a PersistentVolumeClaim.

[**Volume Snapshot Content**]((https://kubernetes.io/docs/concepts/storage/volume-snapshots/))

A snapshot taken from a volume in the cluster that has been provisioned by an administrator. It is a resource in the cluster just like a persistent volume is a cluster resource.

**Volume Mode**

An optional API parameter that describes the specific mode for a persistent volume. Kubernetes supports `Filesystem` and `Block` as `volumeModes`. 

- `filesystem`: A volume with volume mode set to `filesystem` is mounted to a directory by the pod.
- `block`: Use a volume as a raw block device which provides the pod the fastest possible way to access a volume, without any filesystem layer between the pod and the volume.

[**Access Mode**](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes)

A persistent volume can be mounted on a host in any way supported by the resource provider. Access modes supported vary by resource provider, and IOMesh supports `ReadWriteOnce`，`ReadWriteMany`，and `ReadOnlyMany`, but `ReadWriteMany` and `ReadOnlyMany` are only for PVs with `volumemode` as `block`.

- `ReadWriteOnce`: The volume can be mounted as read-write by a single node. ReadWriteOnce access mode still can allow multiple pods to access the volume when the pods are running on the same node.

- `ReadWriteMany`: The volume can be mounted as read-write by many nodes.

- `ReadOnlyMany`: the volume can be mounted as read-only by many nodes.

[**Helm**](https://helm.sh/)

A package manager for Kubernetes that helps find, share, and build Kubernetes with software. It is necessary to have Helm for IOMesh installation.

[**Prometheus**](https://prometheus.io/)

An open source system monitoring and alerting toolkit that can be integrated with IOMesh to help you monitor IOMesh storage metrics in real-time and receive immediate alerts.

[**Grafana**](https://grafana.com/)

A web application that offers real-time charts, graphs, and alerts when connected to supported data sources. It is open source and can import IOMesh dashboard template and alerting rules, allowing you to visualize IOMesh storage metrics.






