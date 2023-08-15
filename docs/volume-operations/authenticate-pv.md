---
id: authenticate-pv
title: Create PV with Authentication 
sidebar_label: Create PV with Authentication  
---

IOMesh allows for volume authentication using Kubernetes secret. Authentication is implemented per StorageClass, and it requires configuration of a secret for encryption along with a CSI secret for authentication in the StorageClass. 

Every time a pod declares the use of a encrypted PVC, the PVC will only be allowed for use if the two secrets match exactly.

**Precautions**
- Since authentication is implemented through iSCSI CHAP, the secret password must be 12-16 characters long according to the password length requirements of the CHAP protocol.
- To ensure that a StorageClass with configured secrets is accessible only to intended users, Role-Based Access Control (RBAC) is necessary. This is because StorageClass is not an object limited to a specific namespace, and some versions of Kubernetes allow all namespaces to access all StorageClasses.

**Procedure**
1. Create a secret that holds credentials for volume authentication.

    In the following command, replace `iomesh` with the username, `iomesh-system` with the namespace where your IOMesh cluster resides, and `abcdefghijklmn` with the password.

    ```bash
    kubectl create secret generic volume-secret -n iomesh-system --from-literal=username=iomesh --from-literal=password=abcdefghijklmn
    ```
2. Create a secret used for authentication with that points to the secret in Step 1. Its username and password remain the same as the secret in step 1.

    ```bash
    kubectl create secret generic user-secret -n user-namespace --from-literal=username=iomesh --from-literal=password=abcdefghijklmn
    ```
3. Create a StorageClass. Enable volume encryption and specify the secrets as instructed below.
    ```yaml
    # Source: authenticate-sc.yaml
    kind: StorageClass
    apiVersion: storage.k8s.io/v1
    metadata:
      name: per-storageclass-auth
    provisioner: com.iomesh.csi-driver 
    reclaimPolicy: Delete
    allowVolumeExpansion: true
    parameters:
      csi.storage.k8s.io/fstype: "ext4"
      replicaFactor: "2"
      thinProvision: "true"
      # Enable PV encryption.
      auth: "true" 
      # The secret holding credentials for encrypting a volume, which will be fetched by the CSI reading in the `annotations` field of the PVC.
      csi.storage.k8s.io/controller-publish-secret-name: volume-secret 
      csi.storage.k8s.io/controller-publish-secret-namespace: iomesh-system
      # The CSI secret that points to the encrypted secret.
      csi.storage.k8s.io/node-stage-secret-name: ${pvc.annotations['iomesh.com/key']}
      csi.storage.k8s.io/node-stage-secret-namespace: ${pvc.namespace}
    ```
    ```shell
    kubectl apply -f authenticate-sc.yaml
    ```
    |Field|Description|
    |---|---|
    |`csi.storage.k8s.io/controller-publish-secret-name`| The secret created in Step 1, holding credentials for encryption.|
    |`csi.storage.k8s.io/controller-publish-secret-namespace`|The namespace where the encryption secret resides.|
    |`csi.storage.k8s.io/node-stage-secret-name`|The CSI secret created in Step 2, pointing to and verifying the encrypted secret. |
    |`csi.storage.k8s.io/node-stage-secret-namespace`|The namespace where the CSI secret resides.|

4. Create a PVC and specify `annotations.iomesh.com/key` with the CSI secret created in Step 2.
    ```yaml
    # Source: authenticate-pvc.yaml
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
    ```shell
    kubectl apply -f authenticate-pvc.yaml
    ```