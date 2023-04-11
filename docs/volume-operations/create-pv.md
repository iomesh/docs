---
id: create-pv
title: Create PV
sidebar_label: Create PV
---

## Create PV

To create a PV, you should first create a PVC. Once done, IOMesh will sense the creation of this PVC and automatically create a new PV based on the `spec` in it, binding them together. Then the pair of PV and PVC will be ready to use.

> _Note:_
> IOMesh supports access modes `ReadWriteOnce`，`ReadWriteMany`，and `ReadOnlyMany`, but `ReadWriteMany` and `ReadOnlyMany` are only for PVs with `volumemode` as Block.

**Prerequisite**

Ensure that there is already a StorageClass available for use.

**Procedure**
1. Create a YAML config `pvc.yaml`. Configure the fields `accessModes`, `storage`, and `volumeMode`.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-example-pvc
    spec:
      storageClassName: iomesh-csi-driver
      accessModes:
        - ReadWriteOnce # Specify the access mode. 
      resources:
        requests:
          storage: 10Gi # Specify the storage value.
      volumeMode: Filesystem # Specify the volume mode.
    ```

    For details, refer to [Kubernetes Documentation](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
  
2. Apply the YAML config to create the PVC. Once done, the corresponding PV will be created.

    ```
    kubectl apply -f pvc.yaml
    ```

3. Verify that the PVC was created.

    ```
    kubectl get pvc iomesh-example-pvc
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    iomesh-example-pvc                          Bound    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   10Gi        RWO            iomesh-csi-driver   21h   
    ```

4. View the PV bound to this PVC.

    ```
    kubectl get pv pvc-34230f3f-47dc-46e8-8c42-38c073c40598
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                        STORAGECLASS
    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   10Gi       Delete           Bound    default/iomesh-example-pvc   iomesh-csi-driver
    ```

## Encrypt PV  

IOMesh allows for volume encryption using Kubernetes secret. Encryption is implemented per StorageClass, and it requires configuration of a secret for encryption along with a CSI secret for authentication in the StorageClass. Every time a pod declares the use of a PVC, the PVC will only be allowed for use if the two secrets match exactly.

**Precautions**
- Since authentication is implemented through iSCSI CHAP, the secret password must be 12-16 characters long according to the password length requirements of the CHAP protocol.
- To ensure that a StorageClass with configured secrets is accessible only to intended users, Role-Based Access Control (RBAC) is necessary. This is because StorageClass is not an object limited to a specific namespace, and some versions of Kubernetes allow all namespaces to access all StorageClasses.

**Procedure**
1. Create a secret that holds credentials for encrypting a volume. The username is `iomesh`, and the namespace is `smtx-system`.

    ```bash
    kubectl create secret generic volume-secret -n smtx-system --from-literal=username=iomesh --from-literal=password=abcdefghijklmn
    ```
2. Create a CSI secret that points to the encrypted secret from step 1. Its username and password remain the same as the secret in step 1.

    ```bash
    kubectl create secret generic user-secret -n user-namespace --from-literal=username=iomesh --from-literal=password=abcdefghijklmn
    ```
3. Create a StorageClass and configure the following fields.
    ```yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: per-storageclass-auth
    provisioner: com.smartx.csi-driver 
    reclaimPolicy: Retain
    allowVolumeExpansion: true
    parameters:
      csi.storage.k8s.io/fstype: "ext4"
      replicaFactor: "2"
      thinProvision: "true"
      # Enable PV encryption.
      auth: "true" 
      # The secret holding credentials for encrypting a volume, which will be fetched by the CSI reading in the `annotations` field of the PVC.
      csi.storage.k8s.io/controller-publish-secret-name: volume-secret 
      csi.storage.k8s.io/controller-publish-secret-namespace: smtx-system
      # The CSI secret that points to the encrypted secret.
      csi.storage.k8s.io/node-stage-secret-name: ${pvc.annotations['iomesh.com/key']}
      csi.storage.k8s.io/node-stage-secret-namespace: ${pvc.namespace}
    ```
    |Field|Description|
    |---|---|
    |`csi.storage.k8s.io/controller-publish-secret-name`| The secret created in Step 1, holding credentials for encryption.|
    |`csi.storage.k8s.io/controller-publish-secret-namespace`|The namespace where the encryption secret resides.|
    |`csi.storage.k8s.io/node-stage-secret-name`|The CSI secret created in Step 1, pointing to and verifying the encrypted secret. |
    |`csi.storage.k8s.io/node-stage-secret-namespace`|The namespace where the CSI secret resides.|

4. Create a PVC and specify `annotations.iomesh.com/key` with the CSI secret created in Step 2.
    ```yaml
    kind: PersistentVolumeClaim
    apiVersion: v1
    metadata:
      name: user-pvc
      namespace: user-namespace
      # Specify the CSI secret created in Step 2.
      annotations:
          iomesh.com/key: user-secret
    spec:
      storageClassName: per-storageclass-auth
      accessModes:
      - ReadWriteOnce
      resources:
        requests:
          storage: 2Gi
    ```